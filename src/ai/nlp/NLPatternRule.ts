var DEREF_ERROR_CANNOT_PROCESS_EXPRESSION:number = 0;
var DEREF_ERROR_NO_REFERENTS:number = 1;
var DEREF_ERROR_CANNOT_DISAMBIGUATE:number = 2;
var DEREF_ERROR_VERB_COMPLETION:number = 3;

class NLParseRecord {
	constructor(nt:TokenizationElement[], b:Bindings, rn:string[], p:number[])
	{
		this.nextTokens = nt;
		this.bindings = b;
		this.ruleNames = rn;
		this.priorities = p;
	}


	higherPriorityThan(pr2:NLParseRecord) : number
	{
		var idx:number = 0;
		while(true) {
			var p1:number = null;
			var p2:number = null;
			if (this.priorities.length >= idx+1) p1 = this.priorities[idx];
			if (pr2.priorities.length >= idx+1) p2 = pr2.priorities[idx];
			if (p1 == null) {
				if (p2 == null) return 0;
				return 1;	// p1 has higher priority
			} else {
				if (p2 == null) return -1;
				if (p1 > p2) return 1;
				if (p1 < p2) return -1;
			}
			idx++;
		}
	}


	// throught he first path
	tokensLeftToParse() : number
	{
		if (this.nextTokens == null || this.nextTokens.length == 0) return 0;
		return this.nextTokens[0].tokensLeftToParse();
	}


	nextTokens:TokenizationElement[] = null;	// this is not a flat list, but all the possible "immediate next" tokens, according to different parses
	bindings:Bindings = null;
	ruleNames:string[] = null;
	priorities:number[] = null;	// the priorities of all the rules used up to this point
	result:Term = null;
}


class NLDerefErrorRecord {
	derefFromContextErrors:TermAttribute[] = [];
	derefUniversalErrors:TermAttribute[] = [];
	derefHypotheticalErrors:TermAttribute[] = [];
	derefQueryErrors:TermAttribute[] = [];

	derefErrorType:number = -1;
	tokensLeftToParse:number = -1;

	toString() : string
	{
		return "NLDerefErrorRecord("+
			   (this.derefFromContextErrors.length>0 ? "context: " + this.derefFromContextErrors:"")+
			   (this.derefUniversalErrors.length>0 ? "universal: " + this.derefUniversalErrors:"")+
			   (this.derefHypotheticalErrors.length>0 ? "hypothetical: " + this.derefHypotheticalErrors:"")+
			   (this.derefQueryErrors.length>0 ? "query: " + this.derefQueryErrors:"")+
			   ")";
	}

	constructor(errorType:number, tokensLeftToParse:number) {
		this.derefErrorType = errorType;
		this.tokensLeftToParse = tokensLeftToParse;
	}
}


class NLPatternContainer {
	constructor(name:string, sv:VariableTermAttribute, lv:VariableTermAttribute) 
	{
		this.name = name;
		this.speakerVariable = sv;
		this.listenerVariable = lv;
	}


	name:string = "";
	speakerVariable:VariableTermAttribute = null;
	listenerVariable:VariableTermAttribute = null;
	lastDerefErrors:NLDerefErrorRecord[] = [];
}


class NLPatternRule extends NLPatternContainer {
	constructor(name:string, h:Term, b:NLPattern, p:number, sv:VariableTermAttribute, lv:VariableTermAttribute)
	{
		super(name, sv, lv);
		this.head = h;
		this.body = b;
		this.priority = p;
	}


	parse(tokenization:TokenizationElement, filterPartialParses:boolean, context:NLContext, parser:NLParser, AI:RuleBasedAI) : NLParseRecord[]
	{
		// parse the sentence:
//		console.log("NLPatternRule.parse");
		this.lastDerefErrors = [];
		var bindings:Bindings = new Bindings();
		if (this.speakerVariable != null) {
//			console.log("Speaker: " + this.speakerVariable);
			bindings.l.push([(<VariableTermAttribute>this.speakerVariable), 
							 new ConstantTermAttribute(context.speaker, parser.o.getSort("#id"))]);
		}
		var parses:NLParseRecord[] = this.body.parse(new NLParseRecord([tokenization], bindings, [], []), context, this, parser, AI);
		if (parses == null) return null;

		// if there is any valid parse, generate the corresponding terms:
		var results:NLParseRecord[] = [];
		for(let parse of parses) {
			if (filterPartialParses &&
				parse.nextTokens != null && parse.nextTokens.length > 0) continue;

			parse.ruleNames = [this.name].concat(parse.ruleNames);
			parse.priorities = [this.priority].concat(parse.priorities);
			parse.result = this.head.applyBindings(parse.bindings);
			NLParser.resolveCons(parse.result, parser.o);
			results.push(parse);
		}

		return results;
	}


	parseWithBindings(parse:NLParseRecord, filterPartialParses:boolean, context:NLContext, parser:NLParser, AI:RuleBasedAI) : NLParseRecord[]
	{
		var results:NLParseRecord[] = [];
		var parses:NLParseRecord[] = this.body.parse(parse, context, this, parser, AI);
		if (parses != null) {
			for(let parse2 of parses) {
				if (filterPartialParses &&
					parse2.nextTokens != null && parse2.nextTokens.length > 0) continue;

				parse2.ruleNames = [this.name].concat(parse.ruleNames);
				parse2.priorities = [this.priority].concat(parse.priorities);
				parse2.result = this.head.applyBindings(parse2.bindings);
				NLParser.resolveCons(parse2.result, parser.o);
//				console.log("parseWithBindings completed, result: " + result.toString() + "\nBindings: " + parse.bindings + "\nBindings Applied: " + bindings2);
				results.push(parse2);
			}
		}

		return results;
	}


	clone() : NLPatternRule
	{
		var map:[TermAttribute,TermAttribute][] = [];
		var head:Term = this.head.clone(map);
		var body:NLPattern = this.body.clone(map);
//		var rule:NLPatternRule = new NLPatternRule(this.name, head, body, this.priority);
		var rule:NLPatternRule = new NLPatternRule(this.name, head, body, this.priority, this.speakerVariable, this.listenerVariable);

		for(let i:number = 0;i<map.length;i++) {
			if (map[i][0] instanceof VariableTermAttribute &&
			    (<VariableTermAttribute>map[i][0]).name == "SPEAKER") {
				rule.speakerVariable = <VariableTermAttribute>map[i][1];
			}
//			if (map[i][0] instanceof VariableTermAttribute &&
//			    (<VariableTermAttribute>map[i][0]).name == "LISTENER") {
//				rule.listenerVariable = <VariableTermAttribute>map[i][1];
//			}
		}

		return rule;
	}


	static fromString(name:string, head:string, body:string, p:number, o:Ontology, sv:VariableTermAttribute, lv:VariableTermAttribute) : NLPatternRule
	{
        var variableNames:string[] = [];
        var variableValues:VariableTermAttribute[] = [];

		var h:Term = Term.fromStringInternal(head, o, variableNames, variableValues).term;
		if (h == null) {
			console.error("NLPatternRule.fromString: cannot parse head: " + head);
			return null;
		}
		var b:NLPattern = NLPattern.fromString(body, o, variableNames, variableValues);
		if (b == null) {
			console.error("NLPatternRule.fromString: cannot parse body: " + body);
			return null;
		}

		var rule:NLPatternRule = new NLPatternRule(name, h, b, p, sv, lv);
		for(let i:number = 0;i<variableNames.length;i++) {
			if (variableNames[i] == "SPEAKER") {
				rule.speakerVariable = variableValues[i];
			}
//			if (variableNames[i] == "LISTENER") {
//				rule.listenerVariable = variableValues[i];
//			}
		}

//		console.log("NLPatternRule.fromString: \n  " + h + "\n  " + b);
		return rule;
	}


	head:Term = null;
	body:NLPattern = null;
	priority:number = 100;
}
