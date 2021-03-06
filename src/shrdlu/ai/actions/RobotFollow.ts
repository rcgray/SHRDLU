class RobotFollow_IntentionAction extends IntentionAction {

	constructor()
	{
		super();
		this.needsContinuousExecution = true;
	}


	canHandle(intention:Term, ai:RuleBasedAI) : boolean
	{
		if (intention.functor.is_a(ai.o.getSort("verb.follow"))) return true;
		return false;
	}


	execute(ir:IntentionRecord, ai_raw:RuleBasedAI) : boolean
	{
		var ai:RobotAI = <RobotAI>ai_raw;
		var intention:Term = ir.action;
		var requester:TermAttribute = ir.requester;

		/*
		if (ai.robot.isInVehicle()) {
			if (requester != null) {
				let term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
				ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
			}
			return true;
		}
		*/		

		if (!ai.visionActive) {
			if (requester != null) {
				let term1:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
				var cause:Term = Term.fromString("property.blind('"+ai.selfID+"'[#id])", ai.o);
				let term2:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.inform("+requester+", property.blind('"+ai.selfID+"'[#id])))", ai.o);
				ai.intentions.push(new IntentionRecord(term1, null, null, new CauseRecord(cause, null, ai.time_in_seconds), ai.time_in_seconds));
				ai.intentions.push(new IntentionRecord(term2, null, null, new CauseRecord(cause, null, ai.time_in_seconds), ai.time_in_seconds));
			}
			return true;
		}

		if (intention.attributes.length==0 ||
			!(intention.attributes[0] instanceof ConstantTermAttribute)) {
			if (requester != null) {
				var term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
				ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
			}				
			return true;
		}
		var targetID:string = (<ConstantTermAttribute>(intention.attributes[1])).value;
		this.targetObject = ai.game.findObjectByIDJustObject(targetID);
		if (this.targetObject == null) {
			if (requester != null) {
				var term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
				var cause:Term = Term.fromString("#not(verb.see('"+ai.selfID+"'[#id], '"+targetID+"'[#id]))", ai.o);
				ai.intentions.push(new IntentionRecord(term, null, null, new CauseRecord(cause, null, ai.time_in_seconds), ai.time_in_seconds));
			}				
			return true;
		}

		var destinationMap:A4Map = this.targetObject.map;

		if (destinationMap == null || destinationMap != ai.robot.map) {
			if (requester != null) {
				var term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
				var cause:Term = Term.fromString("#not(verb.know('"+ai.selfID+"'[#id], #and(the(P:'path'[path], N:[singular]), noun(P, N))))", ai.o);
				ai.intentions.push(new IntentionRecord(term, null, null, new CauseRecord(cause, null, ai.time_in_seconds), ai.time_in_seconds));
			}				
			return true;
		}

		if (requester != null) {
			var tmp:string = "action.talk('"+ai.selfID+"'[#id], perf.ack.ok("+requester+"))";
			var term:Term = Term.fromString(tmp, ai.o);
			ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
		}

		app.achievement_nlp_all_robot_actions[0] = true;
		app.trigger_achievement_complete_alert();

		ai.intentionsCausedByRequest.push(ir);
        ai.setNewAction(intention, requester, null, this);
		ai.addLongTermTerm(new Term(ai.o.getSort("verb.do"),
									  [new ConstantTermAttribute(ai.selfID,ai.cache_sort_id),
									   new TermTermAttribute(intention)]), PERCEPTION_PROVENANCE);

		this.executeContinuous(ai);
		return true;
	}


	executeContinuous(ai_raw:RuleBasedAI) : boolean
	{
		var ai:RobotAI = <RobotAI>ai_raw;

		// Check if we need to leave a vehicle:
		if (ai.robot.isInVehicle()) {
			if ((this.targetObject instanceof A4Character)) {
				let target_c:A4Character = <A4Character>this.targetObject;
				if (target_c.isInVehicle() &&
					ai.robot.vehicle == target_c.vehicle) {
					return false;
				} else {
					ai.robot.disembark();
				}
			} else {
				ai.robot.disembark();
			}
			return false;
		}

		var destinationX:number = this.targetObject.x;
		var destinationY:number = (this.targetObject.y+this.targetObject.tallness);

		// go to destination:
        var q:A4ScriptExecutionQueue = new A4ScriptExecutionQueue(ai.robot, ai.robot.map, ai.game, null);
        var s:A4Script = new A4Script(A4_SCRIPT_GOTO_OPENING_DOORS, this.targetObject.map.name, null, 0, false, false);
        s.x = destinationX;
        s.y = destinationY;
        q.scripts.push(s);
		ai.currentAction_scriptQueue = q;

		return false;
	}


	saveToXML(ai:RuleBasedAI) : string
	{
		let str = "<IntentionAction type=\"RobotFollow_IntentionAction\"";
		if (this.targetObject == null) {
			return str + "/>";
		} else {
			return str + " targetObject=\""+this.targetObject.ID+"\"/>";
		}
	}


	static loadFromXML(xml:Element, ai:RuleBasedAI) : IntentionAction
	{
		let a:RobotFollow_IntentionAction = new RobotFollow_IntentionAction();
		if (xml.getAttribute("targetObject") != null) {
			let game:A4Game = (<A4RuleBasedAI>ai).game;
			let o:A4Object = game.findObjectByIDJustObject(xml.getAttribute("targetObject"));
			a.targetObject = o;
		}
		return a;
	}


	targetObject:A4Object = null;
}
