class PartOfSpeech {  
  constructor(t:string, sn:string, term:Term, p:number)
  {
    this.token = t;
    if (sn[0]=='~') {
      this.sortName = sn.substring(1);
      this.negatedSort = true;
    } else {
      this.sortName = sn;
    }
    this.term = term;
    this.probability = p;
  }


  toString() : string
  {
    return this.term.toString();
  }


  static fromPartOfSpeech(pos:PartOfSpeech) : PartOfSpeech
  {
    return new PartOfSpeech(pos.token, (pos.negatedSort?"~":"")+pos.sortName, pos.term, pos.probability);
  }


  token:string = null;
  negatedSort:boolean = false;
  sortName:string = null;
  term:Term = null;
  probability:number = 1.0;
}


class TokenizationElement {
  constructor(token:string)
  {
    this.token = token;
  }


  // throught he first path
  tokensLeftToParse() : number
  {
    if (this.token == null) return 0;
    if (this.next == null || this.next.length == 0) return 1;
    return 1 + this.next[0].tokensLeftToParse();
  }  


  toString() : string 
  {
    return this.toStringInternal(0);
  }


  toStringInternal(tabs:number) : string 
  {
    var s:string = "";
    if (this.token==null) {
      for(let n of this.next) {
        s += n.toStringInternal(tabs);
      }
    } else {
      for(let i:number = 0;i<tabs;i++) s+=" ";
      s += this.token;
      if (this.POS != null) {
        s +=" [ ";
        for(let pos of this.POS) {
          s += pos.toString() + " ";
        }
        s += "]";
      }
      s += "\n";
      for(let n of this.next) {
        s += n.toStringInternal(tabs+2);
      }
    }
    return s;
  }


  token:string;
  POS:PartOfSpeech[] = null;
  next:TokenizationElement[] = [];
}


class POSParser {
  constructor(o:Ontology) 
  {
    var multitokens_raw: string[] =
    [
      // conjunctions
      "as if",
      "as long as",
      "as much as",
      "as soon as",
      "as though",
      "by the time",
      "even if",
      "even though",
      "in order that",
      "in case",
      "only if",
      "provided that",
      "so that",
      "not only",
      "but also",

      // prepositions:
      "according to",
      "adjacent to",
      "ahead of",
      "allowed in",
      "allowed into",
      "allowed to enter",
      "allowed to access",
      "allowed to go",
      "allowed to go to",
      "allowed to go into",
      "apart from",
      "as for",
      "as of",
      "as per",
      "as regards",
      "aside from",
      "bacl to",
      "because of",
      "behind of",
      "close to",
      "due to",
      "except for",
      "far from",
      "inside of",
      "instead of",
      "left of",
      "near to",
      "next to",
      "not including",
      "opposite of",
      "opposite to",
      "other than",
      "out from",
      "out of",
      "outside of",
      "owing to",
      "access to",
      "permission to",
      "permission to enter",
      "permission to access",
      "permission to go",
      "permission to go to",
      "permission to go into",
      "permitted in",
      "permitted into",
      "permitted to enter",
      "permitted to access",
      "permitted to go",
      "permitted to go to",
      "permitted to go into",
      "prior to",
      "pursuant to",
      "rather than",
      "regardless of",
      "right of",
      "subsequent to",
      "such as",
      "thanks to",
      "up to",
      "north of",
      "northeast of",
      "east of",
      "southeast of",
      "south of",
      "southwest of",
      "west of",
      "northwest of",

      "as far as",
      "as opposed to",
      "as soon as",
      "as well as",

      "at the behest of",
      "by means of",
      "by virtue of",
      "for the sake of",
      "in accordance with",
      "in addition to",
      "in case of",
      "in front of",
      "in lieu of",
      "in place of",
      "in point of",
      "in spite of",
      "on account of",
      "on behalf of",
      "on top of",
      "with regard to",
      "with respect to",
      "with a view to",

      "alone in",

      // pronouns:
      "no one",

      // indefinite pronouns + else:
      "everybody else",
      "everyone else",
      "anyone else",
      "anybody else",
      "someone else",
      "somebody else",

      // adverbs/nouns:
      "out of the way",
      "out of here",
      "after that",
      "right now",
      "in the past",

      // nouns (space):
      "the universe",
      "the milky way",
      "memory bank",
      "memory banks",
      "perception system",
      "perception systems",
      "milky way",
      "tau ceti",
      "the tau ceti system",
      "beta cassini",
      "star system",
      "solar system",
      "the solar system",
      "tau ceti e",

      // other nouns:
      "communicator range",
      "communication range",
      "outer space",
      "tardis 8",
      "key card",
      "access key",
      "aurora station",
      "comm tower",
      "communication tower",
      "recycling facility",
      "oxygen level",
      "oxygen tank",
      "water filtering facility",
      "power plant",
      "battery charger",
      "recharging station",
      "solar panel",
      "spacer valley",
      "maintenance key",
      "maintenance room key",
      "garage key",
      "bedroom key",
      "lab key",
      "laboratory key",
      "command key",
      "master key",
      "maintenance room",
      "laundry room",
      "mess hall",
      "space suit",
      "space suits",
      "stasis key",
      "stasis pod",
      "stasis pods",
      "stasis room",
      "stasis chamber",
      "stasis pod room",
      "stasis pod room",
      "command room",
      "bedroom 1",
      "bedroom 2",
      "bedroom 3",
      "bedroom 4",
      "bedroom 5",
      "bedroom 6",
      "bedroom 7",
      "bedroom 8",
      "bedroom 9",
      "bedroom 10",
      "bedroom 11",
      "bedroom 12",
      "room 1",
      "room 2",
      "room 3",
      "room 4",
      "room 5",
      "room 6",
      "room 7",
      "room 8",
      "room 9",
      "room 10",
      "room 11",
      "room 12",      
      "main bathroom",
      "infirmary bathroom",
      "water bottle",
      "milk bottle",
      "jump suit",
      "test tube",
      "plastic reel",
      "maintenance robot",
      "maintenance guy",
      "maintenance person",
      "rover driver",
      "rover battery",
      "rover batteries",
      "user name",
      "stasis room door",
      "stasis door",
      "door to the stasis room",
      "door number 1",
      "door 1",
      "door number 2",
      "door 2",
      "door number 3",
      "door 3",
      "door number 4",
      "door 4",
      "door number 5",
      "door 5",
      "door number 6",
      "door 6",
      "door number 7",
      "door 7",
      "door number 8",
      "door 8",
      "door number 9",
      "door 9",
      "door number 10",
      "door 10",
      "door number 11",
      "door 11",
      "door number 12",
      "door 12",
      "lab door",
      "laboratory door",
      "door to the maintenance room",
      "maintenance door",
      "garage door",
      "north garage door",
      "south garage door",
      "command center door",
      "command door",
      "3d printer",
      "metal 3d printer",
      "plastic 3d printer",
      "infirmary bed",
      "computer table",
      "computer tower",
      "gym bench",
      "powder milk",
      "scifi writer",
      "science fiction writer",
      "washing machine",
      "computer password",
      "fixing tool",
      "fixing tools",

      // adjectives:
      "in stasis",

      // adverbs:
      "a bit",
      "a little bit",
      "a tiny bit",

      // random other words:
      "artificial intelligence",
      "artificial intelligences",
      "atari 2600",
      "cave in",
      "commodore 64",
      "commodore amiga",
      "european union",
      "united states of america",
      "zx spectrum",
      "3 laws of robotics",
      "three laws of robotics",
      "the 3 laws of robotics",
      "the three laws of robotics",

      "arthur c. clarke",
      "arthur c clarke",
      "sir isaac newton",

      "msx computer",
      "vg 8020"
    ];

    // punctuation:
    this.addTokenPOS(new PartOfSpeech(",", ",", Term.fromString("comma()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech(".", ".", Term.fromString("stop()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech(";", ":", Term.fromString("colon()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech(";", ";", Term.fromString("semicolon()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("-", "-", Term.fromString("dash()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("!", "!", Term.fromString("exclamation()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("?", "?", Term.fromString("question()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("'", "'", Term.fromString("quote()", o), 1.0));

    // interjections:
    this.addTokenPOS(new PartOfSpeech("hm", "hmm", Term.fromString("interjection-sound()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("hmm", "hmm", Term.fromString("interjection-sound()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("hmmm", "hmm", Term.fromString("interjection-sound()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("hmmmm", "hmm", Term.fromString("interjection-sound()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("hmmmmm", "hmm", Term.fromString("interjection-sound()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("well", "well", Term.fromString("interjection-noun()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("hello", "hello", Term.fromString("interjection-noun()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("hi", "hello", Term.fromString("interjection-noun()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("hey", "hello", Term.fromString("interjection-noun()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("yo", "hello", Term.fromString("interjection-noun()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("ok", "ok", Term.fromString("interjection-noun()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("okay", "ok", Term.fromString("interjection-noun()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("good", "good", Term.fromString("interjection-noun()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("thanks", "thanks", Term.fromString("interjection-noun()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("farewell", "farewell", Term.fromString("interjection-noun()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("goodbye", "farewell", Term.fromString("interjection-noun()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("bye", "farewell", Term.fromString("interjection-noun()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("please", "please", Term.fromString("interjection-noun()", o), 1.0));

    // particles:
    this.addTokenPOS(new PartOfSpeech("yes", "yes", Term.fromString("yes()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("yeah", "yes", Term.fromString("yes()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("no", "no", Term.fromString("no()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("nope", "no", Term.fromString("no()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("not", "no", Term.fromString("no()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("sure", "yes", Term.fromString("yes()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("and", "#and", Term.fromString("#and()", o), 1.0));
//    this.addTokenPOS(new PartOfSpeech("on", "particle.on", Term.fromString("particle.on()", o), 1.0));
//    this.addTokenPOS(new PartOfSpeech("off", "particle.off", Term.fromString("particle.off()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("nothing", "nothing", Term.fromString("nothing()", o), 1.0));

    // conjunctions:
    this.addTokenPOS(new PartOfSpeech("but", "conjunction-contrast", Term.fromString("conjunction-contrast()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("however", "conjunction-contrast", Term.fromString("conjunction-contrast()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("so", "conjunction-consequence", Term.fromString("conjunction-consequence()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("thus", "conjunction-consequence", Term.fromString("conjunction-consequence()", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("therefore", "conjunction-consequence", Term.fromString("conjunction-consequence()", o), 1.0));

    // determiners:
    this.addTokenPOS(new PartOfSpeech("a", "a", Term.fromString("indefinite-article('a'[symbol], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("an", "a", Term.fromString("indefinite-article('a'[symbol], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("the", "the", Term.fromString("definite-article('the'[symbol], [grammatical-number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("some", "some", Term.fromString("indefinite-article('some'[symbol], [plural])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("any", "article.any", Term.fromString("indefinite-article('article.any'[symbol], [grammatical-number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("much", "much", Term.fromString("indefinite-article('much'[symbol], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("many", "much", Term.fromString("indefinite-article('much'[symbol], [plural])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("all", "all", Term.fromString("definite-article('all'[symbol], [plural])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("every", "every", Term.fromString("definite-article('every'[symbol], [singular])", o), 1.0));
    
    this.addTokenPOS(new PartOfSpeech("my", "determiner.my", Term.fromString("possessive-determiner('determiner.my'[symbol], [grammatical-number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("our", "determiner.our", Term.fromString("possessive-determiner('determiner.our'[symbol], [grammatical-number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("your", "determiner.your", Term.fromString("possessive-determiner('determiner.your'[symbol], [grammatical-number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("his", "determiner.his", Term.fromString("possessive-determiner('determiner.his'[symbol], [grammatical-number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("her", "determiner.her", Term.fromString("possessive-determiner('determiner.her'[symbol], [grammatical-number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("its", "determiner.its", Term.fromString("possessive-determiner('determiner.its'[symbol], [grammatical-number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("their", "determiner.their", Term.fromString("possessive-determiner('determiner.their'[symbol], [grammatical-number])", o), 1.0));

    this.addTokenPOS(new PartOfSpeech("this", "close-demonstrative-determiner", Term.fromString("close-demonstrative-determiner('close-demonstrative-determiner'[symbol], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("these", "close-demonstrative-determiner", Term.fromString("close-demonstrative-determiner('close-demonstrative-determiner'[symbol], [plural])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("that", "far-demonstrative-determiner", Term.fromString("far-demonstrative-determiner('far-demonstrative-determiner'[symbol], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("those", "far-demonstrative-determiner", Term.fromString("far-demonstrative-determiner('far-demonstrative-determiner'[symbol], [plural])", o), 1.0));

    this.addTokenPOS(new PartOfSpeech("other", "determiner.other", Term.fromString("determiner('determiner.other'[symbol], [grammatical-number])", o), 1.0));

    // pronouns:
    this.addTokenPOS(new PartOfSpeech("i", "subject-personal-pronoun.i", Term.fromString("subject-personal-pronoun('subject-personal-pronoun.i'[symbol],[singular],[gender],[first-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("we", "subject-personal-pronoun.i", Term.fromString("subject-personal-pronoun('subject-personal-pronoun.i'[symbol],[plural],[gender],[first-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("you", "subject-personal-pronoun.you", Term.fromString("subject-personal-pronoun('subject-personal-pronoun.you'[symbol],[grammatical-number],[gender],[second-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("he", "subject-personal-pronoun.it", Term.fromString("subject-personal-pronoun('subject-personal-pronoun.it'[symbol],[singular],[gender-masculine],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("she", "subject-personal-pronoun.it", Term.fromString("subject-personal-pronoun('subject-personal-pronoun.it'[symbol],[singular],[gender-femenine],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("it", "subject-personal-pronoun.it", Term.fromString("subject-personal-pronoun('subject-personal-pronoun.it'[symbol],[singular],[gender-neutral],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("they", "subject-personal-pronoun.it", Term.fromString("subject-personal-pronoun('subject-personal-pronoun.it'[symbol],[plural],[gender],[third-person])", o), 1.0));

    this.addTokenPOS(new PartOfSpeech("me", "object-personal-pronoun.i", Term.fromString("object-personal-pronoun('object-personal-pronoun.i'[symbol],[singular],[gender],[first-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("us", "object-personal-pronoun.i", Term.fromString("object-personal-pronoun('object-personal-pronoun.i'[symbol],[plural],[gender],[first-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("'s", "object-personal-pronoun.i", Term.fromString("object-personal-pronoun('object-personal-pronoun.i'[symbol],[plural],[gender],[first-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("you", "object-personal-pronoun.you", Term.fromString("object-personal-pronoun('object-personal-pronoun.you'[symbol],[grammatical-number],[gender],[second-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("him", "object-personal-pronoun.it", Term.fromString("object-personal-pronoun('object-personal-pronoun.it'[symbol],[singular],[gender-masculine],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("her", "object-personal-pronoun.it", Term.fromString("object-personal-pronoun('object-personal-pronoun.it'[symbol],[singular],[gender-femenine],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("it", "object-personal-pronoun.it", Term.fromString("object-personal-pronoun('object-personal-pronoun.it'[symbol],[singular],[gender-neutral],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("them", "object-personal-pronoun.it", Term.fromString("object-personal-pronoun('object-personal-pronoun.it'[symbol],[plural],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("this", "close-demonstrative-pronoun", Term.fromString("demonstrative-pronoun('close-demonstrative-pronoun'[symbol],[singular],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("these", "close-demonstrative-pronoun", Term.fromString("demonstrative-pronoun('close-demonstrative-pronoun'[symbol],[plural],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("that", "far-demonstrative-pronoun", Term.fromString("demonstrative-pronoun('far-demonstrative-pronoun'[symbol],[singular],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("those", "far-demonstrative-pronoun", Term.fromString("demonstrative-pronoun('far-demonstrative-pronoun'[symbol],[plural],[gender],[third-person])", o), 1.0));

    this.addTokenPOS(new PartOfSpeech("myself", "reflexive-pronoun.i", Term.fromString("reflexive-pronoun('reflexive-pronoun.i'[symbol],[singular],[gender],[first-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("ourselves", "reflexive-pronoun.i", Term.fromString("reflexive-pronoun('reflexive-pronoun.i'[symbol],[plural],[gender],[first-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("yourself", "reflexive-pronoun.you", Term.fromString("reflexive-pronoun('reflexive-pronoun.you'[symbol],[singular],[gender],[second-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("yourselves", "reflexive-pronoun.you", Term.fromString("reflexive-pronoun('reflexive-pronoun.you'[symbol],[plural],[gender],[second-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("himself", "reflexive-pronoun.it", Term.fromString("reflexive-pronoun('reflexive-pronoun.it'[symbol],[singular],[gender-masculine],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("herself", "reflexive-pronoun.it", Term.fromString("reflexive-pronoun('reflexive-pronoun.it'[symbol],[singular],[gender-femenine],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("itself", "reflexive-pronoun.it", Term.fromString("reflexive-pronoun('reflexive-pronoun.it'[symbol],[singular],[gender-neutral],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("themselves", "reflexive-pronoun.it", Term.fromString("reflexive-pronoun('reflexive-pronoun.it'[symbol],[plural],[gender],[third-person])", o), 1.0));

    this.addTokenPOS(new PartOfSpeech("what", "pronoun.what", Term.fromString("interrogative-pronoun('pronoun.what'[symbol],[grammatical-number],[gender-neutral],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("who", "pronoun.who", Term.fromString("interrogative-pronoun('pronoun.who'[symbol],[grammatical-number],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("which", "pronoun.which", Term.fromString("interrogative-pronoun('pronoun.which'[symbol],[grammatical-number],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("whom", "pronoun.whom", Term.fromString("interrogative-pronoun('pronoun.whom'[symbol],[grammatical-number],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("whose", "pronoun.whose", Term.fromString("interrogative-pronoun('pronoun.whose'[symbol],[grammatical-number],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("where", "pronoun.where", Term.fromString("interrogative-pronoun('pronoun.where'[symbol],[grammatical-number],[gender-neutral],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("how", "pronoun.how", Term.fromString("interrogative-pronoun('pronoun.how'[symbol],[grammatical-number],[gender-neutral],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("when", "pronoun.when", Term.fromString("interrogative-pronoun('pronoun.when'[symbol],[grammatical-number],[gender-neutral],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("why", "pronoun.why", Term.fromString("interrogative-pronoun('pronoun.why'[symbol],[grammatical-number],[gender-neutral],[third-person])", o), 1.0));

    this.addTokenPOS(new PartOfSpeech("mine", "possessive-pronoun.i", Term.fromString("possessive-pronoun('possessive-pronoun.i'[symbol],[singular],[gender],[first-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("ours", "possessive-pronoun.i", Term.fromString("possessive-pronoun('possessive-pronoun.i'[symbol],[plural],[gender],[first-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("yours", "possessive-pronoun.you", Term.fromString("possessive-pronoun('possessive-pronoun.you'[symbol],[singular],[gender],[second-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("yours", "possessive-pronoun.you", Term.fromString("possessive-pronoun('possessive-pronoun.you'[symbol],[plural],[gender],[second-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("his", "possessive-pronoun.it", Term.fromString("possessive-pronoun('possessive-pronoun.it'[symbol],[singular],[gender-masculine],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("hers", "possessive-pronoun.it", Term.fromString("possessive-pronoun('possessive-pronoun.it'[symbol],[singular],[gender-femenine],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("theirs", "possessive-pronoun.it", Term.fromString("possessive-pronoun('possessive-pronoun.it'[symbol],[plural],[gender],[third-person])", o), 1.0));

    this.addTokenPOS(new PartOfSpeech("some", "pronoun.some", Term.fromString("indefinite-pronoun('pronoun.some'[symbol],[plural],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("all", "pronoun.all", Term.fromString("indefinite-pronoun('pronoun.all'[symbol],[plural],[gender],[third-person])", o), 1.0));
//    this.addTokenPOS(new PartOfSpeech("there", "pronoun.there", Term.fromString("indefinite-pronoun('pronoun.there'[symbol],[grammatical-number],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("anyone", "pronoun.anyone", Term.fromString("indefinite-pronoun('pronoun.anyone'[symbol],[singular],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("anybody", "pronoun.anyone", Term.fromString("indefinite-pronoun('pronoun.anyone'[symbol],[singular],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("someone", "pronoun.someone", Term.fromString("indefinite-pronoun('pronoun.someone'[symbol],[plural],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("somebody", "pronoun.someone", Term.fromString("indefinite-pronoun('pronoun.someone'[symbol],[plural],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("no one", "pronoun.noone", Term.fromString("indefinite-pronoun('pronoun.noone'[symbol],[plural],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("everybody", "pronoun.everybody", Term.fromString("indefinite-pronoun('pronoun.everybody'[symbol],[singular],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("everyone", "pronoun.everybody", Term.fromString("indefinite-pronoun('pronoun.everybody'[symbol],[singular],[gender],[third-person])", o), 1.0));

    this.addTokenPOS(new PartOfSpeech("something", "pronoun.something", Term.fromString("indefinite-pronoun('pronoun.something'[symbol],[singular],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("anything", "pronoun.anything", Term.fromString("indefinite-pronoun('pronoun.anything'[symbol],[singular],[gender],[third-person])", o), 1.0));

    this.addTokenPOS(new PartOfSpeech("everybody else", "pronoun.everybody.else", Term.fromString("indefinite-pronoun('pronoun.everybody.else'[symbol],[singular],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("everyone else", "pronoun.everybody.else", Term.fromString("indefinite-pronoun('pronoun.everybody.else'[symbol],[singular],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("anyone else", "pronoun.anyone.else", Term.fromString("indefinite-pronoun('pronoun.anyone.else'[symbol],[singular],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("anybody else", "pronoun.anyone.else", Term.fromString("indefinite-pronoun('pronoun.anyone.else'[symbol],[singular],[gender],[third-person])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("someone else", "pronoun.anyone.else", Term.fromString("indefinite-pronoun('pronoun.anyone.else'[symbol],[grammatical-number],[gender],[third-person])", o), 1.0));

    // prepositions:
/*
NLPAddTokenPOS("aboard", PartOfSpeech.generatePreposition("aboard", POS_TYPE_PPREPOSITION_PLACE));
NLPAddTokenPOS("about", PartOfSpeech.generatePreposition("about", POS_TYPE_PPREPOSITION_PLACE));
NLPAddTokenPOS("about", PartOfSpeech.generatePreposition("about", POS_TYPE_PPREPOSITION_TIME));
/*
  ["above",  "PREP"],
  ["across",  "PREP"],
  ["after",  "PREP"],
  ["against",  "PREP"],
  */
this.addTokenPOS(new PartOfSpeech("alone in", "alone-in", Term.fromString("preposition('alone-in'[alone-in])", o), 1.0));
  /*
  ["along",  "PREP"],
  ["alongside",  "PREP"],
  ["amid",  "PREP"],
  ["among",  "PREP"],
  ["amongst",  "PREP"],
  ["apropos",  "PREP"],
  ["apud",  "PREP"],
  ["around",  "PREP"],
  ["as",  "PREP"],
  ["astride",  "PREP"],
*/
this.addTokenPOS(new PartOfSpeech("at", "space.at", Term.fromString("preposition('space.at'[space.at])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("at", "time.at", Term.fromString("preposition('time.at'[time.at])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("barring", "~=", Term.fromString("preposition('~='[~=])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("on", "space.on.top.of", Term.fromString("preposition('space.on.top.of'[space.on.top.of])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("on", "time.at", Term.fromString("preposition('time.at'[time.at])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("atop", "space.on.top.of", Term.fromString("preposition('space.on.top.of'[space.on.top.of])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("ontop", "space.on.top.of", Term.fromString("preposition('space.on.top.of'[space.on.top.of])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("beside", "~=", Term.fromString("preposition('~='[~=])", o), 1.0));
/*
  ["before",  "PREP"],
*/
this.addTokenPOS(new PartOfSpeech("behind", "space.behind", Term.fromString("preposition('space.behind'[space.behind])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("behind of", "space.behind", Term.fromString("preposition('space.behind'[space.behind])", o), 1.0));
/*
  ["below",  "PREP"],
  ["beneath",  "PREP"],
  */
this.addTokenPOS(new PartOfSpeech("beside", "~=", Term.fromString("preposition('~='[~=])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("besides", "~=", Term.fromString("preposition('~='[~=])", o), 1.0));
  /*
  ["between",  "PREP"],
  ["beyond",  "PREP"],
  ["but",  "PREP"],
  *
NLPAddTokenPOS("by", PartOfSpeech.generatePreposition("by", POS_TYPE_PPREPOSITION_PLACE));
NLPAddTokenPOS("by", PartOfSpeech.generatePreposition("by", POS_TYPE_PPREPOSITION_ORIGIN));
  /*
  ["chez",  "PREP"],
  ["circa",  "PREP"],
  ["come",  "PREP"],
  ["despite",  "PREP"],
NLPAddTokenPOS("down", PartOfSpeech.generatePreposition("down", POS_TYPE_PPREPOSITION_PLACE));
NLPAddTokenPOS("down", PartOfSpeech.generatePreposition("down", POS_TYPE_PPREPOSITION_DIRECTION));
NLPAddTokenPOS("during", PartOfSpeech.generatePreposition("during", POS_TYPE_PPREPOSITION_TIME));
*/
this.addTokenPOS(new PartOfSpeech("except", "~=", Term.fromString("preposition('~='[~=])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("for", "relation.purpose", Term.fromString("preposition('relation.purpose'[relation.purpose])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("from", "space.at", Term.fromString("preposition('space.at'[space.at])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("inside", "space.inside.of", Term.fromString("preposition('space.inside.of'[space.inside.of])", o), 1.0));
/*
  ["into",  "PREP"],
  ["less",  "PREP"],
  ["like",  "PREP"],
  ["minus",  "PREP"],
*/
this.addTokenPOS(new PartOfSpeech("near", "space.near", Term.fromString("preposition('space.near'[space.near])", o), 1.0));
/*
  ["nearer",  "PREP"],
  ["nearest",  "PREP"],
  ["notwithstanding",  "PREP"],
*/
this.addTokenPOS(new PartOfSpeech("of", "relation.composition", Term.fromString("preposition('relation.composition'[relation.composition])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("of", "relation.origin", Term.fromString("preposition('relation.origin'[relation.origin])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("of", "relation.belongs", Term.fromString("preposition('relation.belongs'[relation.belongs])", o), 1.0));
/*
  ["off",  "PREP"],
  ["onto",  "PREP"],
  ["opposite",  "PREP"],
NLPAddTokenPOS("out", PartOfSpeech.generatePreposition("out", POS_TYPE_PPREPOSITION_PLACE));
*/
this.addTokenPOS(new PartOfSpeech("over", "time.at", Term.fromString("preposition('time.at'[time.at])", o), 1.0));
  /*
  ["pace",  "PREP"],
  ["past",  "PREP"],
  ["per",  "PREP"],
  ["post",  "PREP"],  // often hyphenated
  ["pre",  "PREP"],   // often hyphenated
  ["pro",  "PREP"],   // often hyphenated
  ["qua",  "PREP"],
  ["sans",  "PREP"],
  ["save",  "PREP"],
  ["short",  "PREP"],
*/
this.addTokenPOS(new PartOfSpeech("since", "relation.cause", Term.fromString("preposition('relation.cause'[relation.cause])", o), 1.0));
/*
  ["than",  "PREP"],
  */
this.addTokenPOS(new PartOfSpeech("through", "relation.through", Term.fromString("preposition('relation.through'[relation.through])", o), 1.0));
  /*
NLPAddTokenPOS("through", PartOfSpeech.generatePreposition("through", POS_TYPE_PPREPOSITION_DIRECTION));
/*
  ["throughout",  "PREP"],
*/

this.addTokenPOS(new PartOfSpeech("to", "relation.target", Term.fromString("preposition('relation.target'[relation.target])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("to", "relation.purpose", Term.fromString("preposition('relation.purpose'[relation.purpose])", o), 1.0));
/*
  ["toward",  "PREP"],
  ["towards",  "PREP"],
*
NLPAddTokenPOS("under", PartOfSpeech.generatePreposition("under", POS_TYPE_PPREPOSITION_PLACE));
NLPAddTokenPOS("underneath", PartOfSpeech.generatePreposition("underneath", POS_TYPE_PPREPOSITION_PLACE));
  /*
  ["unlike",  "PREP"],
  ["until",  "PREP"],
  ["til",  "PREP"],
  ["till",  "PREP"],
  *
NLPAddTokenPOS("up", PartOfSpeech.generatePreposition("up", POS_TYPE_PPREPOSITION_DIRECTION));
  /*
  ["upon",  "PREP"],
  ["upside",  "PREP"],
  ["versus",  "PREP"],
  ["vs",  "PREP"],
  *
NLPAddTokenPOS("via", PartOfSpeech.generatePreposition("via", POS_TYPE_PPREPOSITION_DIRECTION));
  /*
  ["vice",  "PREP"],
*/
this.addTokenPOS(new PartOfSpeech("with", "relation.contains", Term.fromString("preposition('relation.contains'[relation.contains])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("with", "relation.tool", Term.fromString("preposition('relation.tool'[relation.tool])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("within", "space.at", Term.fromString("preposition('space.at'[space.at])", o), 1.0));
/*
  ["without",  "PREP"],
  ["worth",  "PREP"],
*/

  // multi-word prepositions:
this.addTokenPOS(new PartOfSpeech("north of", "space.north.of", Term.fromString("preposition('space.north.of'[space.north.of])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("northeast of", "space.northeast.of", Term.fromString("preposition('space.northeast.of'[space.northeast.of])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("east of", "space.east.of", Term.fromString("preposition('space.east.of'[space.east.of])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("southeast of", "space.southeast.of", Term.fromString("preposition('space.southeast.of'[space.southeast.of])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("south of", "space.south.of", Term.fromString("preposition('space.south.of'[space.south.of])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("southwest of", "space.southwest.of", Term.fromString("preposition('space.southwest.of'[space.southwest.of])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("west of", "space.west.of", Term.fromString("preposition('space.west.of'[space.west.of])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("northwest of", "space.northwest.of", Term.fromString("preposition('space.northwest.of'[space.northwest.of])", o), 1.0));

/*
  "according to",
  "adjacent to",
  "ahead of",
*/
this.addTokenPOS(new PartOfSpeech("apart from", "~=", Term.fromString("preposition('~='[~=])", o), 1.0));
/*
  "as for",
  "as of",
  "as per",
  "as regards",
  "aside from",
  "back to",
  */
this.addTokenPOS(new PartOfSpeech("because of", "relation.cause", Term.fromString("preposition('relation.cause'[relation.cause])", o), 1.0));
  /*
NLPAddTokenPOS("close to", PartOfSpeech.generatePreposition("close to", POS_TYPE_PPREPOSITION_PLACE));
NLPAddTokenPOS("close to", PartOfSpeech.generatePreposition("close to", POS_TYPE_PPREPOSITION_TIME));
NLPAddTokenPOS("due to", PartOfSpeech.generatePreposition("close to", POS_TYPE_PPREPOSITION_CAUSE));
  */
this.addTokenPOS(new PartOfSpeech("except for", "~=", Term.fromString("preposition('~='[~=])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("far from", "space.far", Term.fromString("preposition('space.far'[space.far])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("inside of", "space.inside.of", Term.fromString("preposition('space.inside.of'[space.inside.of])", o), 1.0));
  /*
  "instead of",
  "left of",
  */
this.addTokenPOS(new PartOfSpeech("near to", "space.near", Term.fromString("preposition('space.near'[space.near])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("not including", "~=", Term.fromString("preposition('~='[~=])", o), 1.0));
  /*
NLPAddTokenPOS("next to", PartOfSpeech.generatePreposition("next to", POS_TYPE_PPREPOSITION_PLACE));
  /*
  "opposite of",
  "opposite to",
  */
this.addTokenPOS(new PartOfSpeech("other than", "~=", Term.fromString("preposition('~='[~=])", o), 1.0));
  /*
  "out from",
*/
this.addTokenPOS(new PartOfSpeech("out of", "space.outside.of", Term.fromString("preposition('space.outside.of'[space.outside.of])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("outside of", "space.outside.of", Term.fromString("preposition('space.outside.of'[space.outside.of])", o), 1.0));
  /*
  "owing to",
  */
this.addTokenPOS(new PartOfSpeech("access to", "permission-to-access", Term.fromString("preposition('permission-to-access'[permission-to-access])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("permission to", "permission-to-access", Term.fromString("preposition('permission-to-access'[permission-to-access])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("permission to go", "permission-to-access", Term.fromString("preposition('permission-to-access'[permission-to-access])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("permission to go to", "permission-to-access", Term.fromString("preposition('permission-to-access'[permission-to-access])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("permission to go into", "permission-to-access", Term.fromString("preposition('permission-to-access'[permission-to-access])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("permission to access", "permission-to-access", Term.fromString("preposition('permission-to-access'[permission-to-access])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("permission to enter", "permission-to-access", Term.fromString("preposition('permission-to-access'[permission-to-access])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("permitted to access", "permitted-in", Term.fromString("preposition('permitted-in'[permitted-in])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("permitted in", "permitted-in", Term.fromString("preposition('permitted-in'[permitted-in])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("permitted into", "permitted-in", Term.fromString("preposition('permitted-in'[permitted-in])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("permitted to go", "permitted-in", Term.fromString("preposition('permitted-in'[permitted-in])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("permitted to go to", "permitted-in", Term.fromString("preposition('permitted-in'[permitted-in])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("permitted to go into", "permitted-in", Term.fromString("preposition('permitted-in'[permitted-in])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("permitted to enter", "permitted-in", Term.fromString("preposition('permitted-in'[permitted-in])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("allowed to access", "permitted-in", Term.fromString("preposition('permitted-in'[permitted-in])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("allowed in", "permitted-in", Term.fromString("preposition('permitted-in'[permitted-in])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("allowed into", "permitted-in", Term.fromString("preposition('permitted-in'[permitted-in])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("allowed to go", "permitted-in", Term.fromString("preposition('permitted-in'[permitted-in])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("allowed to go to", "permitted-in", Term.fromString("preposition('permitted-in'[permitted-in])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("allowed to go into", "permitted-in", Term.fromString("preposition('permitted-in'[permitted-in])", o), 1.0));
this.addTokenPOS(new PartOfSpeech("allowed to enter", "permitted-in", Term.fromString("preposition('permitted-in'[permitted-in])", o), 1.0));
  /*
  "prior to",
  "pursuant to",
  "rather than",
  "regardless of",
  "right of",
  "subsequent to",
  "such as",
  "thanks to",
  "up to",

  "as far as",
  "as opposed to",
  "as soon as",
  "as well as",

  "at the behest of",
  "by means of",
  "by virtue of",
  "for the sake of",
  "in accordance with",
  "in addition to",
  "in case of",
  */
  this.addTokenPOS(new PartOfSpeech("in front of", "space.in.front.of", Term.fromString("preposition('space.in.front.of'[space.in.front.of])", o), 1.0));
  /*
  "in lieu of",
  "in place of",
  "in point of",
  "in spite of",
  "on account of",
  "on behalf of",
  */
  this.addTokenPOS(new PartOfSpeech("on top of", "space.on.top.of", Term.fromString("preposition('space.on.top.of'[space.on.top.of])", o), 1.0));
  /*
  "with regard to",
  "with respect to",
  "with a view to",
  */  

  this.addTokenPOS(new PartOfSpeech("larger", "relation.larger", Term.fromString("preposition('relation.larger'[relation.larger])", o), 1.0));
  this.addTokenPOS(new PartOfSpeech("smaller", "relation.smaller", Term.fromString("preposition('relation.smaller'[relation.smaller])", o), 1.0));

  // these one are here at the end, to overwrite "because of" and "within":
  this.addTokenPOS(new PartOfSpeech("because", "relation.cause", Term.fromString("preposition('relation.cause'[relation.cause])", o), 1.0));  
  this.addTokenPOS(new PartOfSpeech("in", "space.at", Term.fromString("preposition('space.at'[space.at])", o), 1.0));



    // numerals:
    this.addTokenPOS(new PartOfSpeech("one", "number.1", Term.fromString("cardinal('1'[number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("two", "number.2", Term.fromString("cardinal('2'[number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("three", "number.3", Term.fromString("cardinal('3'[number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("four", "number.4", Term.fromString("cardinal('4'[number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("five", "number.5", Term.fromString("cardinal('5'[number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("six", "number.6", Term.fromString("cardinal('6'[number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("seven", "number.7", Term.fromString("cardinal('7'[number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("eight", "number.8", Term.fromString("cardinal('8'[number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("nine", "number.9", Term.fromString("cardinal('9'[number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("ten", "number.10", Term.fromString("cardinal('10'[number])", o), 1.0));

    this.addTokenPOS(new PartOfSpeech("first", "number.1", Term.fromString("ordinal('1'[number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("second", "number.2", Term.fromString("ordinal('2'[number])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("third", "number.3", Term.fromString("ordinal('3'[number])", o), 1.0));

    // proper nouns
    this.addTokenPOS(new PartOfSpeech("tau ceti", "tau ceti", Term.fromString("proper-noun('tau ceti'[symbol], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("beta cassini", "beta cassini", Term.fromString("proper-noun('beta cassini'[symbol], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("aurora", "aurora", Term.fromString("proper-noun('aurora'[symbol], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("space", "outer-space", Term.fromString("proper-noun('space'[symbol], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("ai", "ai", Term.fromString("proper-noun('ai'[symbol], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("station ai", "station ai", Term.fromString("proper-noun('station ai'[symbol], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("artificial intelligence", "ai", Term.fromString("proper-noun('artificial intelligence'[symbol], [singular])", o), 1.0));

    var proper_nouns:string[] = [/*
                                 "james", "john", "robert", "michael", "william",
                                 "david", "richard", "charles", "joseph", "thomas",
                                 "christopher", "daniel", "paul", "mark"," donald",
                                 "george", "kenneth", "steven", "edward", "brian",
                                 "ronald", "anthony", "kevin", "jason", "matthew",
                                 "gary", "timothy", "larry", "jeffrey", "frank",
                                 "scott", "eric", "stephen", "andrew", "raymond",
                                 "gregory", "joshua", "jerry", "dennis", "walter",
                                 "patrick", "peter", "harold", "douglas", "henry",
                                 "carl", "arthur", "ryan", "roger", "joe", "jack",
                                 "albert", "jonathan", "justin", "terry", "gerald", 
                                 "keith", "samuel", "willie", "ralph", "lawrence",
                                 "nicholas", "roy", "benjamin", "bruce", "brandon",
                                 "adam", "harry", "fred", "wayne", "billy", "steve",
                                 "louis", "jeremy", "aaron", "randy", "howard", 
                                 "eugene", "russell", "bobby", "victor", "martin",
                                 "ernest", "phillip", "todd", "jesse", "craig",
                                 "alan", "shawn", "clarence", "sean", "philip",
                                 "chris", "johnny", "eral", "jimmy", "danny",
                                 "bryan", "tony", "mike", "stanley", "leonard",
                                 "nathan", "dale", "manuel", "rodney", "curtis",
                                 "norman", "allen", "marvin", "vincent", "glenn",
                                 "jeffery", "travis", "jeff", "chad", "jacob",
                                 "lee", "melvin", "alfred", "kyle", "francis",
                                 "bradley", "jesus", "herbert", "frederick", "ray",
                                 "joel", "edwin", "don", "eddie", "ricky", 
                                 "troy", "randall", "barry", "alexander", "bernard",
                                 "mario", "leroy", "marcus", "micheal", "theodore",
                                 "clifford", "oscar", "jay", "jim", "tom", 
                                 "calvin", "alex", "jon", "ronnie", "bill", 
                                 "lloyd", "tommy", "leon", "derek", "warren", 
                                 "darrell", "jerome", "floyd", "leo", "alvin",
                                 "tim", "wesley", "gordon", "dean", "greg", 
                                 "dustin", "derrick", "dan", "lewis", "zachary",
                                 "corey", "herman", "maurice", "vernon", "clyde",
                                 "glen", "hector", "shane", "sam", "rick", 
                                 "lester", "brent", "ramon", "charlie", "tyler", 
                                 "gilbert", "gene", "marc", "reginald", "ruben", 
                                 "brett", "angel", "nathaniel", "rafael", "leslie",
                                 "edgar", "milton", "raul", "ben", "chester", 
                                 "cecil", "duane", "franklin", "andre", "elmer", 
                                 "brad", "gabriel", "ron", "mitchell", "roland",
                                 "arnold", "harvey", "jared", "adrian", "karl", 
                                 "cory", "claude", "erik", "darryl", "jamie", 
                                 "neil", "jessie", "christian", "clinton", "ted",
                                 "mathew", "tyrone", "darren", "lonnie", "lance",
                                 "cody", "julio", "kelly", "kurt", "allan", 
                                 "nelson", "guy", "clayton", "hugh", "max", 
                                 "dwayne", "armando", "felix", "jimmie", "everett",
                                 "jordan", "ian", "wallace", "ken", "bob", 
                                 "jaime", "Casey", "dave", "ivan", "johnnie",
                                 "sidney", "byron", "julian", "isaac", "morris",
                                 "clifton", "willard", "daryl", "andy", "marshall",
                                 "perry", "kirk", "marion", "tracy", "seth",
                                 "kent", "terrance", "rene", "terrence", "freddie",
                                 "wade",

                                 "mary", "paricia", "linda", "barbara", "elizabeth",
                                 "jennifer", "maria", "susan", "margaret", "dorothy", 
                                 "dorothy", "lisa", "nancy", "karen", "betty", 
                                 "helen", "sandra", "donna", "carol", "ruth", 
                                 "sharon", "michelle", "laura", "sarah", "kimberly",
                                 "deborah", "jessica", "shirley", "cynthia", "angela",
                                 "melissa", "brenda", "amy", "anna", "rebecca", 
                                 "virginia", "kathleen", "pamela", "martha", "debra",
                                 "amanda", "stephanie", "carolyn", "christine", "marie",
                                 "janet", "catherine", "frances", "ann", "joyce",
                                 "diane", "alice", "julia", "heather", "teresa",
                                 "doris", "gloria", "evelyn", "jean", "cheryl",
                                 "milfred", "katherine", "joan", "ashley", "judith",
                                 "rose", "janice", "kelly", "nicole", "judy",
                                 "christina", "kathy", "theresa", "beverly", "denise",
                                 "tammy", "irene", "jane", "lori", "rachel", 
                                 "marilyn", "andrea", "kathryn", "louise", "sara",
                                 "anne", "jacqueline", "wanda", "bonnie", "julia", 
                                 "ruby", "lois", "tina", "phyllis", "norma", 
                                 "paula", "diana", "annie", "lillian", "emily",
                                 "robin", "peggy", "crystal", "rita", "dawn",
                                 "connie", "florence", "tracy", "edna", "tiffany",
                                 "carmen", "rosa", "cindy", "grace", "wendy",
                                 "victoria", "edith", "kim", "sherry", "sylvia",
                                 "stacy", "dana", "marion", "samantha", "june", 
                                 "annette", "yvonne", "audrey", "bernice", "dolores",
                                 "beatrice", "erica", "regina", "sally", "lynn", 
                                 "lorraine", "joann", "cathy", "lauren", "geraldine", 
                                 "erin", "jill", "veronica", "darlene", "bertha", 
                                 "gail", "michele", "suzanne", "alicia", "megan", 
                                 "danielle", "valerie", "eleanor", "joanne", "jamie",
                                 "lucille", "clara", "leslie", "april", "debbie",
                                 "eva", "amber", "hazel", "rhonda", "anita", 
                                 "juanita", "emma", "pauline", "esther", "monica", 
                                 "charlotte", "carrie", "marjorie", "elaine", "ellen",
                                 "ethel", "sheila", "shannon", "thelma", "josephine", 
                                 "ana", "renee", "ida", "vivian", "roberta", 
                                 "holly", "britany", "melanie", "loretta", "yolanda",
                                 "jeanette", "laurie", "katie", "kristen", "vanessa",
                                 "alma", "sue", "elsie", "beth", "jeanne", 
                                 "vicki", "carla", "tara", "rosemary", "eileen",
                                 "terri", "gertrude", "lucy", "tonya", "ella", 
                                 "stacey", "wilma", "gina", "kristin", "jessie",
                                 "natalie", "agnes", "vera", "charlene", "bessie",
                                 "delores", "melinda", "pearl", "arlene", "maureen",
                                 "colleen", "allison", "tamara", "joy", "georgia",
                                 "constance", "lillie", "claudia", "jackie", "marcia",
                                 "tanya", "nellie", "minnie", "marlene", "claire",
                                 "katrina", "erika", "sherri", "ramona", "daisy", 
                                 "shelly", "mae", "misty", "toni", "kristina",
                                 "violet", "bobbie", "becky", "velma", "miriam",
                                 "sonia", "felicia", "jenny", "leona", "tracey", 
                                 "dianne", "billie", "olga", "brandy", "carole",
                                 "naomi", "priscilla", "kay", "penny", "leah",
                                 "cassandra", "nina", "margie", "nora", "jennie",
                                 "gwendolyn", "hilda", "patsy", "deanna", "christy",
                                 "lena", "myrtle", "marsha", "mabel", "irma",
                                 "maxine", "terry", "mattie", "vickie", "jo",
                                 "dora", "caroline", "stella", "marian", "courtney",
                                 "viola", "lydia", "glenda", "heidi",

                                 "socrates","plato","aristotle",
                                 */
                                 "etaoin", "shrdlu", "qwerty", "jcuken", "david",
                                 "aurora station"];
    for(let proper_noun of proper_nouns) {
      this.addTokenPOS(new PartOfSpeech(proper_noun, "symbol", Term.fromString("proper-noun('"+proper_noun+"'[symbol], [singular])", o), 1.0));
    }

    // synonyms (those that I don't want the AI to use):
    this.addStandardNounPOS("access key", "key-card", o);

    // nouns:
    this.addStandardNounPOS("3d printer", "3dprinter", o);
    this.addStandardNounPOS("age", "property.age", o);
    this.addStandardNounPOS("ai", "ai", o);
    this.addStandardNounPOS("airlock", "airlock", o);
    this.addTokenPOS(new PartOfSpeech("analysis", "analysis", Term.fromString("noun('analysis'[analysis], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("analyses", "analysis", Term.fromString("noun('analysis'[analysis], [plural])", o), 1.0));
    this.addStandardNounPOS("animal", "animal", o);
    this.addTokenPOS(new PartOfSpeech("anomaly", "anomaly", Term.fromString("noun('anomaly'[anomaly], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("anomalies", "anomaly", Term.fromString("noun('anomaly'[anomaly], [plural])", o), 1.0));
    this.addStandardNounPOS("area", "space.area", o);
    this.addStandardNounPOS("arm", "arm", o);
    this.addStandardNounPOS("artificial intelligence", "ai", o);
    this.addTokenPOS(new PartOfSpeech("aside", "space.away", Term.fromString("noun('space.away'[space.away], [singular])", o), 1.0));
    this.addStandardNounPOS("astronomer", "astronomer", o);
    this.addTokenPOS(new PartOfSpeech("away", "space.away", Term.fromString("noun('space.away'[space.away], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("back", "space.back", Term.fromString("noun('space.back'[space.back], [singular])", o), 1.0));
    this.addStandardNounPOS("barrel", "barrel", o);
    this.addStandardNounPOS("basket", "basket", o);
    this.addStandardNounPOS("bathroom", "bathroom", o);
    this.addTokenPOS(new PartOfSpeech("battery", "battery", Term.fromString("noun('battery'[battery], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("batteries", "battery", Term.fromString("noun('battery'[battery], [plural])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("rover battery", "rover-battery", Term.fromString("noun('rover-battery'[rover-battery], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("rover batteries", "rover-battery", Term.fromString("noun('rover-battery'[rover-battery], [plural])", o), 1.0));
    this.addStandardNounPOS("bed", "bed", o);
    this.addStandardNounPOS("bedroom", "bedroom", o);
    this.addStandardNounPOS("being", "living-being", o);
    this.addStandardNounPOS("bench", "bench", o);
    this.addStandardNounPOS("biologist", "biologist", o);
    this.addStandardNounPOS("body", "body", o);
    this.addStandardNounPOS("body part", "body-part", o);
    this.addStandardNounPOS("bottle", "bottle", o);
    this.addStandardNounPOS("bottom", "space.bottom", o);
    this.addStandardNounPOS("boulder", "rock", o);
    this.addTokenPOS(new PartOfSpeech("box", "box", Term.fromString("noun('box'[box], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("boxes", "box", Term.fromString("noun('box'[box], [plural])", o), 1.0));
    this.addStandardNounPOS("brightness", "brightness", o);
    this.addStandardNounPOS("cable", "cable", o);
    this.addStandardNounPOS("can", "can", o);
    this.addStandardNounPOS("canyon", "canyon", o);
    this.addStandardNounPOS("captain", "captain", o);
    this.addStandardNounPOS("card", "card", o);
    this.addStandardNounPOS("cave", "cave", o);
    this.addStandardNounPOS("cave in", "cave-in", o);
    this.addStandardNounPOS("century", "time.century", o);
    this.addStandardNounPOS("chair", "chair", o);
    this.addStandardNounPOS("character", "character", o);
    this.addStandardNounPOS("colour", "color", o);    // synonym, so, it's out of order
    this.addStandardNounPOS("color", "color", o);    
    this.addStandardNounPOS("communication", "communication", o);
    this.addStandardNounPOS("comm tower", "communication.tower", o);
    this.addStandardNounPOS("communication tower", "communication.tower", o);
    this.addStandardNounPOS("communicator", "communicator", o);
    this.addStandardNounPOS("computer", "computer", o);
    this.addStandardNounPOS("computer table", "computer-table", o);
    this.addStandardNounPOS("computer tower", "computer-tower", o);
    this.addStandardNounPOS("coordinate", "space.position", o);
    this.addTokenPOS(new PartOfSpeech("coordination", "coordination", Term.fromString("noun('coordination'[coordination], [singular])", o), 1.0));
    this.addStandardNounPOS("corpse", "corpse", o);    
    this.addStandardNounPOS("corridor", "corridor", o);
    this.addStandardNounPOS("course", "path", o);
    this.addStandardNounPOS("crate", "crate", o);
    this.addTokenPOS(new PartOfSpeech("damage", "damage", Term.fromString("noun('damage'[damage], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("data", "data", Term.fromString("noun('data'[data], [grammatical-number])", o), 1.0));
    this.addStandardNounPOS("day", "time.day", o);
    this.addTokenPOS(new PartOfSpeech("degree celsius", "temperature.unit.celsius", Term.fromString("noun('temperature.unit.celsius'[temperature.unit.celsius], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("degrees celsius", "temperature.unit.celsius", Term.fromString("noun('temperature.unit.celsius'[temperature.unit.celsius], [plural])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("C", "temperature.unit.celsius", Term.fromString("noun('temperature.unit.celsius'[temperature.unit.celsius], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("C", "temperature.unit.celsius", Term.fromString("noun('temperature.unit.celsius'[temperature.unit.celsius], [plural])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("diary", "diary", Term.fromString("noun('diary'[diary], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("diaries", "diary", Term.fromString("noun('diary'[diary], [plural])", o), 1.0));
    this.addStandardNounPOS("direction", "facing-direction", o);
    this.addStandardNounPOS("direction", "cardinal-direction", o);
    this.addStandardNounPOS("display", "screen", o);
    this.addStandardNounPOS("distance", "distance", o);
    this.addStandardNounPOS("drink", "drink", o);
    this.addStandardNounPOS("door", "door", o);
    this.addStandardNounPOS("dumbbell", "dumbbell", o);
    this.addStandardNounPOS("dumbell", "dumbbell", o);
    this.addTokenPOS(new PartOfSpeech("dust", "dust", Term.fromString("noun('dust'[dust], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("dust", "dust", Term.fromString("noun('dust'[dust], [plural])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("dust", "dust", Term.fromString("noun('dust'[dust], [uncountable])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("east", "east", Term.fromString("noun('east'[east], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("emergency", "emergency", Term.fromString("noun('emergency'[emergency], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("emergencies", "emergency", Term.fromString("noun('emergency'[emergency], [plural])", o), 1.0));
    this.addStandardNounPOS("end", "space.end", o);
    this.addStandardNounPOS("end", "time.end", o);
    this.addStandardNounPOS("engine", "engine", o);
    this.addTokenPOS(new PartOfSpeech("equipment", "equipment", Term.fromString("noun('equipment'[equipment], [grammatical-number])", o), 1.0));
    this.addStandardNounPOS("event", "event", o);
    this.addStandardNounPOS("exit", "space.exit", o);
    this.addStandardNounPOS("explosive", "explosive", o);
    this.addStandardNounPOS("eye", "eye", o);
    this.addTokenPOS(new PartOfSpeech("facility", "facility", Term.fromString("noun('facility'[facility], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("facilities", "facility", Term.fromString("noun('facility'[facility], [plural])", o), 1.0));
    this.addStandardNounPOS("feeling", "feeling", o);
    this.addStandardNounPOS("fixing tool", "tool", o);
    this.addUncountableNounPOS("food", "food", o);
    this.addTokenPOS(new PartOfSpeech("foot", "foot", Term.fromString("noun('foot'[foot], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("feet", "foot", Term.fromString("noun('foot'[foot], [plural])", o), 1.0));
    this.addStandardNounPOS("fridge", "fridge", o);
    this.addStandardNounPOS("front", "space.front", o);
    this.addStandardNounPOS("functionality", "role", o);
    this.addTokenPOS(new PartOfSpeech("fungi", "fungi", Term.fromString("noun('fungi'[furniture], [plural])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("fungus", "fungi", Term.fromString("noun('fungi'[furniture], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("furniture", "furniture", Term.fromString("noun('furniture'[furniture], [grammatical-number])", o), 1.0));
    this.addStandardNounPOS("g", "gravity.unit.g", o);
    this.addStandardNounPOS("galaxy", "galaxy", o);
    this.addStandardNounPOS("garage", "garage", o);
    this.addStandardNounPOS("gravity", "gravity", o);
    this.addStandardNounPOS("greenhouse", "greenhouse.facility", o);
    this.addStandardNounPOS("gym", "gym.room", o);
    this.addStandardNounPOS("gym bench", "gym-bench", o);
    this.addStandardNounPOS("gymnasium", "gym.room", o);
    this.addStandardNounPOS("hand", "hand", o);
    this.addTokenPOS(new PartOfSpeech("hardware", "hardware", Term.fromString("noun('hardware'[hardware], [grammatical-number])", o), 1.0));
    this.addStandardNounPOS("head", "head", o);
    this.addTokenPOS(new PartOfSpeech("height", "height", Term.fromString("noun('height'[height], [singular])", o), 1.0));
    this.addStandardNounPOS("helmet", "helmet", o);
    this.addTokenPOS(new PartOfSpeech("here", "space.here", Term.fromString("noun('space.here'[space.here], [singular])", o), 1.0));
    this.addStandardNounPOS("hour", "time.hour", o);
    this.addStandardNounPOS("human", "human", o);
    this.addStandardNounPOS("infirmary", "infirmary", o);
    this.addStandardNounPOS("infirmary bed", "infirmary-bed", o);
    this.addStandardNounPOS("instant", "time.location", o);
    this.addStandardNounPOS("instruction", "instruction", o);
    this.addStandardNounPOS("item", "item", o);
    this.addStandardNounPOS("jumpsuit", "jumpsuit", o);
    this.addStandardNounPOS("jump suit", "jumpsuit", o);
    this.addStandardNounPOS("key", "key", o);
    this.addStandardNounPOS("keycard", "key-card", o);
    this.addStandardNounPOS("key card", "key-card", o);
    this.addStandardNounPOS("kg", "kilogram", o);
    this.addStandardNounPOS("kilogram", "kilogram", o);
    this.addStandardNounPOS("km", "kilometer", o);
    this.addStandardNounPOS("kilometer", "kilometer", o);
    this.addStandardNounPOS("kitchen", "kitchen", o);
    this.addStandardNounPOS("lab", "lab.room", o);
    this.addTokenPOS(new PartOfSpeech("laboratory", "lab.room", Term.fromString("noun('lab.room'[lab.room], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("laboratories", "lab.room", Term.fromString("noun('lab.room'[lab.room], [plural])", o), 1.0));
    this.addStandardNounPOS("language", "language", o);
    this.addStandardNounPOS("laundry room", "laundry.room", o);
    this.addStandardNounPOS("left", "direction.left", o);
    this.addStandardNounPOS("leg", "leg", o);
    this.addStandardNounPOS("light", "light", o);
    this.addStandardNounPOS("life", "life", o);
    this.addUncountableNounPOS("life", "living-being", o);
    this.addStandardNounPOS("living being", "living-being", o);
    this.addStandardNounPOS("location", "space.location", o);
    this.addStandardNounPOS("machine", "machine", o);
    this.addStandardNounPOS("maintenance guy", "maintenance-robot", o);
    this.addStandardNounPOS("maintenance person", "maintenance-robot", o);
    this.addStandardNounPOS("maintenance robot", "maintenance-robot", o);
    this.addTokenPOS(new PartOfSpeech("man", "man", Term.fromString("noun('man'[man], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("men", "man", Term.fromString("noun('man'[man], [plural])", o), 1.0));
    this.addStandardNounPOS("map", "map", o);
    this.addStandardNounPOS("mathematician", "mathematician", o);
    this.addStandardNounPOS("medic", "medic", o);
    this.addStandardNounPOS("memory bank", "memory-bank", o);
    this.addStandardNounPOS("metal 3d printer", "metal-3dprinter", o);
    this.addStandardNounPOS("meter", "meter", o);
    this.addStandardNounPOS("mess hall", "mess.hall", o);
    this.addStandardNounPOS("microscope", "microscope", o);
    this.addUncountableNounPOS("milk", "milk", o);
    this.addStandardNounPOS("milk bottle", "milk-bottle", o);
    this.addTokenPOS(new PartOfSpeech("millenium", "time.millenium", Term.fromString("noun('time.millenium'[time.millenium], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("millenia", "time.millenium", Term.fromString("noun('time.millenium'[time.millenium], [plural])", o), 1.0));
    this.addStandardNounPOS("mineral", "mineral", o);
    this.addStandardNounPOS("minute", "time.minute", o);
    this.addStandardNounPOS("moment", "time.location", o);
    this.addStandardNounPOS("month", "time.month", o);
    this.addTokenPOS(new PartOfSpeech("msx", "msx.computer", Term.fromString("noun('msx.computer'[msx.computer], [singular])", o), 1.0));
    this.addStandardNounPOS("msx computer", "msx.computer", o);
    this.addStandardNounPOS("vg-8020", "vg8020.computer", o);
    this.addStandardNounPOS("vg 8020", "vg8020.computer", o);
    this.addStandardNounPOS("vg8020", "vg8020.computer", o);
    this.addTokenPOS(new PartOfSpeech("name", "name", Term.fromString("noun('name'[name], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("north", "north", Term.fromString("noun('north'[north], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("northeast", "northeast", Term.fromString("noun('northeast'[northeast], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("northwest", "northwest", Term.fromString("noun('northwest'[northwest], [singular])", o), 1.0));
    this.addStandardNounPOS("number", "number", o);
    this.addStandardNounPOS("object", "object", o);
    this.addStandardNounPOS("obstacle", "obstacle", o);
    this.addStandardNounPOS("one", "number.1", o);
    this.addTokenPOS(new PartOfSpeech("out of the way", "space.away", Term.fromString("noun('space.away'[space.away], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("out of here", "space.away", Term.fromString("noun('space.away'[space.away], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("out", "space.outside", Term.fromString("noun('space.outside'[space.outside], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("outside", "space.outside", Term.fromString("noun('space.outside'[space.outside], [singular])", o), 1.0));
    this.addStandardNounPOS("owner", "owner", o);
    this.addStandardNounPOS("oxygen level", "oxygen-level", o);
    this.addStandardNounPOS("oxygen tank", "oxygentank.facility", o);
    this.addStandardNounPOS("panel", "panel", o);
    this.addStandardNounPOS("path", "path", o);
    this.addStandardNounPOS("password", "password", o);
    this.addStandardNounPOS("computer password", "password", o);
    this.addTokenPOS(new PartOfSpeech("people", "human", Term.fromString("noun('human'[human], [plural])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("perception", "perception-system", Term.fromString("noun('perception-system'[perception-system], [singular])", o), 1.0));
    this.addStandardNounPOS("perception system", "perception-system", o);
    this.addStandardNounPOS("performative", "performative", o);
    this.addUncountableNounPOS("permission", "permission-to-access", o);
    this.addUncountableNounPOS("access", "permission-to-access", o);
    this.addStandardNounPOS("person", "human", o);
    this.addStandardNounPOS("physicist", "physicist", o);
    this.addStandardNounPOS("place", "space.location", o);
    this.addStandardNounPOS("planet", "planet", o);
    this.addStandardNounPOS("plastic 3d printer", "plastic-3dprinter", o);
    this.addStandardNounPOS("plastic reel", "plastic-reel", o);
    this.addTokenPOS(new PartOfSpeech("pliers", "pliers", Term.fromString("noun('pliers'[pliers], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("pliers", "pliers", Term.fromString("noun('pliers'[pliers], [plural])", o), 1.0));
    this.addStandardNounPOS("pod", "pod", o);
    this.addStandardNounPOS("point", "space.position", o);
    this.addStandardNounPOS("position", "space.position", o);
    this.addStandardNounPOS("poster", "poster", o);
    this.addUncountableNounPOS("powder milk", "powder-milk", o);
    this.addStandardNounPOS("power plant", "powerplant.facility", o);
    this.addStandardNounPOS("powerplant", "powerplant.facility", o);
    this.addStandardNounPOS("problem", "property.problem", o);
    this.addTokenPOS(new PartOfSpeech("process", "process", Term.fromString("noun('process'[process], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("processes", "process", Term.fromString("noun('process'[process], [plural])", o), 1.0));
    this.addStandardNounPOS("profession", "profession", o);
    this.addTokenPOS(new PartOfSpeech("property", "property", Term.fromString("noun('property'[property], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("properties", "property", Term.fromString("noun('property'[property], [plural])", o), 1.0));
    this.addStandardNounPOS("question", "perf.question", o);
    this.addStandardNounPOS("radius", "radius", o);    
    this.addStandardNounPOS("ration", "ration", o);
    this.addTokenPOS(new PartOfSpeech("reanimation", "reanimation", Term.fromString("noun('reanimation'[reanimation], [singular])", o), 1.0));
    this.addStandardNounPOS("battery charger", "batteryrecharge.facility", o);
    this.addStandardNounPOS("recharging station", "batteryrecharge.facility", o);
    this.addStandardNounPOS("recycling facility", "recycling.facility", o);
    this.addStandardNounPOS("reel", "reel", o);
    this.addStandardNounPOS("refrigerator", "fridge", o);
    this.addStandardNounPOS("report", "report", o);
    this.addStandardNounPOS("request", "perf.request", o);
    this.addStandardNounPOS("right", "direction.right", o);
    this.addStandardNounPOS("rock", "rock", o);
    this.addStandardNounPOS("robot", "robot", o);
    this.addStandardNounPOS("role", "role", o);
    this.addStandardNounPOS("rope", "rope", o);
    this.addStandardNounPOS("room", "room", o);
    this.addStandardNounPOS("rover", "rover", o);
    this.addStandardNounPOS("rover driver", "rover-driver", o);
    this.addStandardNounPOS("sausage", "sausage", o);
    this.addStandardNounPOS("scifi writer", "scifi-writer", o);
    this.addStandardNounPOS("scientist", "scifi-writer", o);
    this.addStandardNounPOS("science fiction writer", "scifi-writer", o);
    this.addStandardNounPOS("scientist", "scientist", o);
    this.addStandardNounPOS("screen", "screen", o);
    this.addStandardNounPOS("screwdriver", "screwdriver", o);
    this.addStandardNounPOS("second", "time.second", o);
    this.addStandardNounPOS("sentence", "sentence", o);
    this.addStandardNounPOS("settlement", "settlement", o);
    this.addStandardNounPOS("shape", "shape", o);
    this.addTokenPOS(new PartOfSpeech("shelf", "shelves", Term.fromString("noun('shelves'[shelves], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("shelves", "shelves", Term.fromString("noun('shelves'[shelves], [plural])", o), 1.0));
    this.addStandardNounPOS("ship", "ship", o);
    this.addStandardNounPOS("shovel", "spade", o);
    this.addStandardNounPOS("shower", "shower", o);
    this.addStandardNounPOS("shuttle", "shuttle", o);
    this.addStandardNounPOS("sink", "sink", o);
    this.addStandardNounPOS("situation", "situation", o);
    this.addStandardNounPOS("soda", "soda", o);
    this.addStandardNounPOS("solar panel", "solarpanel.facility", o);
    this.addStandardNounPOS("sound", "sound", o);
    this.addTokenPOS(new PartOfSpeech("south", "south", Term.fromString("noun('south'[south], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("southeast", "southeast", Term.fromString("noun('southeast'[southeast], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("southwest", "southwest", Term.fromString("noun('southwest'[southwest], [singular])", o), 1.0));
    this.addStandardNounPOS("space", "space", o);
    this.addStandardNounPOS("spaceship", "spaceship", o);
    this.addStandardNounPOS("outer space", "outer-space", o);
    this.addStandardNounPOS("spacesuit", "spacesuit", o);
    this.addStandardNounPOS("space suit", "spacesuit", o);
    this.addStandardNounPOS("spade", "spade", o);
    this.addStandardNounPOS("star", "star", o);
    this.addStandardNounPOS("star system", "star-system", o);
    this.addStandardNounPOS("starship", "spaceship", o);
    this.addStandardNounPOS("start", "space.start", o);
    this.addStandardNounPOS("start", "time.start", o);
    this.addStandardNounPOS("stasis pod", "stasis-pod", o);
    this.addStandardNounPOS("state", "state", o);
    this.addStandardNounPOS("state", "powered.state", o);
    this.addStandardNounPOS("station", "station", o);
    this.addStandardNounPOS("storage room", "storage.room", o);
    this.addStandardNounPOS("stove", "stove", o);
    this.addStandardNounPOS("strength", "strength", o);
    this.addStandardNounPOS("suit", "suit", o);
    this.addStandardNounPOS("supervisor", "supervisor", o);
    this.addStandardNounPOS("system", "system", o);
    this.addStandardNounPOS("table", "table", o);
    this.addStandardNounPOS("tear", "tear", o);
    this.addStandardNounPOS("temperature", "temperature", o);
    this.addStandardNounPOS("test", "test", o);
    this.addStandardNounPOS("testtube", "test-tube", o);
    this.addStandardNounPOS("test tube", "test-tube", o);
    this.addTokenPOS(new PartOfSpeech("there", "space.there", Term.fromString("noun('space.there'[space.there], [singular])", o), 1.0));
    this.addStandardNounPOS("thing", "object", o);
    this.addTokenPOS(new PartOfSpeech("3 laws of robotics", "three-laws-of-robotics", Term.fromString("noun('three-laws-of-robotics'[three-laws-of-robotics], [plural])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("three laws of robotics", "three-laws-of-robotics", Term.fromString("noun('three-laws-of-robotics'[three-laws-of-robotics], [plural])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("the 3 laws of robotics", "three-laws-of-robotics", Term.fromString("noun('three-laws-of-robotics'[three-laws-of-robotics], [plural])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("the three laws of robotics", "three-laws-of-robotics", Term.fromString("noun('three-laws-of-robotics'[three-laws-of-robotics], [plural])", o), 1.0));
    this.addStandardNounPOS("time", "time", o);
    this.addStandardNounPOS("tyre", "tire", o);  // synonym, so it's out of order
    this.addStandardNounPOS("tire", "tire", o);
    this.addTokenPOS(new PartOfSpeech("today", "time.today", Term.fromString("noun('time.today'[time.today], [singular])", o), 1.0));
    this.addStandardNounPOS("toilet", "toilet", o);
    this.addStandardNounPOS("tool", "tool", o);
    this.addTokenPOS(new PartOfSpeech("toolbox", "toolbox", Term.fromString("noun('toolbox'[toolbox], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("toolboxes", "toolbox", Term.fromString("noun('toolbox'[toolbox], [plural])", o), 1.0));
    this.addStandardNounPOS("tower", "tower", o);
    this.addStandardNounPOS("transmission", "transmission", o);
    this.addStandardNounPOS("treadmill", "treadmill", o);
    this.addStandardNounPOS("tube", "tube", o);
    this.addStandardNounPOS("tunnel", "tunnel", o);
    this.addStandardNounPOS("universe", "universe", o);
    this.addStandardNounPOS("unit", "measuring-unit", o);
    this.addStandardNounPOS("user name", "username", o);
    this.addStandardNounPOS("username", "username", o);
    this.addStandardNounPOS("vehicle", "vehicle", o);
    this.addStandardNounPOS("vitamins", "vitamins", o);
    this.addTokenPOS(new PartOfSpeech("vitamins", "vitamins", Term.fromString("noun('vitamins'[vitamins], [singular])", o), 1.0));
    this.addStandardNounPOS("voice", "voice", o);
    this.addStandardNounPOS("wall", "wall", o);
    this.addStandardNounPOS("washing machine", "washing-machine", o);
    this.addUncountableNounPOS("water", "water", o);
    this.addStandardNounPOS("water bottle", "water-bottle", o);
    this.addStandardNounPOS("water filtering facility", "waterfiltering.facility", o);
    this.addStandardNounPOS("week", "time.week", o);
    this.addTokenPOS(new PartOfSpeech("weight", "weight", Term.fromString("noun('weight'[weight], [singular])", o), 1.0));
    this.addStandardNounPOS("weight", "dumbbell", o);
    this.addStandardNounPOS("welcome", "state.welcome", o);
    this.addTokenPOS(new PartOfSpeech("west", "west", Term.fromString("noun('west'[west], [singular])", o), 1.0));
    this.addStandardNounPOS("window", "window", o);
    this.addStandardNounPOS("wonder", "state.wonder", o);
    this.addTokenPOS(new PartOfSpeech("woman", "woman", Term.fromString("noun('woman'[woman], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("women", "woman", Term.fromString("noun('woman'[woman], [plural])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("wrench", "wrench", Term.fromString("noun('wrench'[wrench], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("wrenches", "wrench", Term.fromString("noun('wrench'[wrench], [plural])", o), 1.0));
    this.addStandardNounPOS("writer", "writer", o);
    this.addStandardNounPOS("year", "time.year", o);
    this.addTokenPOS(new PartOfSpeech("yesterday", "time.yesterday", Term.fromString("noun('time.yesterday'[time.yesterday], [singular])", o), 1.0));

    // verbs:
    this.addTokenPOS(new PartOfSpeech("to be", "verb.be", Term.fromString("verb('verb.be'[symbol], [grammatical-number], [no-person], [infinitive-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("be", "verb.be", Term.fromString("verb('verb.be'[symbol], [grammatical-number], [no-person], [infinitive-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("being", "verb.be", Term.fromString("verb('verb.be'[symbol], [grammatical-number], [no-person], [gerund-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("been", "verb.be", Term.fromString("verb('verb.be'[symbol], [grammatical-number], [no-person], [participle-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("'m", "verb.be", Term.fromString("verb('verb.be'[symbol], [singular], [first-person], [present-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("am", "verb.be", Term.fromString("verb('verb.be'[symbol], [singular], [first-person], [present-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("'re", "verb.be", Term.fromString("verb('verb.be'[symbol], [plural], [first-person], [present-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("'re", "verb.be", Term.fromString("verb('verb.be'[symbol], [grammatical-number], [second-person], [present-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("are", "verb.be", Term.fromString("verb('verb.be'[symbol], [plural], [first-person], [present-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("are", "verb.be", Term.fromString("verb('verb.be'[symbol], [grammatical-number], [second-person], [present-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("'s", "verb.be", Term.fromString("verb('verb.be'[symbol], [singular], [third-person], [present-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("is", "verb.be", Term.fromString("verb('verb.be'[symbol], [singular], [third-person], [present-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("are", "verb.be", Term.fromString("verb('verb.be'[symbol], [plural], [third-person], [present-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("was", "verb.be", Term.fromString("verb('verb.be'[symbol], [singular], [first-person], [past-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("were", "verb.be", Term.fromString("verb('verb.be'[symbol], [plural], [first-person], [past-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("were", "verb.be", Term.fromString("verb('verb.be'[symbol], [grammatical-number], [second-person], [past-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("was", "verb.be", Term.fromString("verb('verb.be'[symbol], [singular], [third-person], [past-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("were", "verb.be", Term.fromString("verb('verb.be'[symbol], [plural], [third-person], [past-tense])", o), 1.0));

    // these are synonims of the verbs below, but I have them earlier, so that they are overwritten by the ones below for use
    // by the natural language generator:
    this.addStandardVerbPOS("verb.colonize", "populate","populates","populated","populated","populating", false, multitokens_raw, o);

    this.addStandardVerbPOS("verb.access", "access","accesses","accessed","accessed","accessing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.obtain", "acquire","acquires","acquired","acquired","acquiring", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.follow", "accompany","accompanies","accompanied","accompanied","accompanying", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.allow", "allow","allows","allowed","allowed","allowing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.analyze", "analyze","analyzes","analyzed","analyzed","analyzing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.arrive", "arrive","arrives","arrived","arrived","arriving", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.arrive-to", "arrive to","arrives to","arrived to","arrived to","arriving to", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.ask", "ask","asks","asked","asked","asking", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.bring", "bring","brings","brought","brought","bringing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.build", "build","builds","built","built","building", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.call", "call","calls","called","called","calling", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.can", "can","can","could",null,null, true, multitokens_raw, o);
    this.addStandardVerbPOS("verb.cause", "cause","causes","caused","caused","causing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.connect", "connect","connects","connected","connected","connecting", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.fill", "charge","charges","charged","charged","charging", false, multitokens_raw, o);
    this.addStandardVerbPOS("action.close", "close","closes","closed","closed","closing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.colonize", "colonize","colonizes","colonized","colonized","colonizing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.come", "come","comes","came","come","coming", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.come-back", "come back","comes back","came back","come back","coming back", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.come-to", "come to","comes to","came to","come to","coming to", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.damage", "damage","damages","damaged","damaged","damaging", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.define", "define","defines","defined","defined","defining", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.disambiguate", "disambiguate","disambiguates","disambiguated","disambiguated","disambiguating", false, multitokens_raw, o);
    this.addStandardVerbPOS("action.disembark", "disembark","disembarks","disembarked","disembarked","disembarking", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.do", "do","does","did","done","doing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.enumerate", "enumerate","enumerates","enumerated","enumerated","enumerating", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.enter", "enter","enters","entered","entered","entering", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.examine", "examine","examines","examined","examined","examining", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.face", "face","faces","faced","faced","facing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.leave", "exit","exits","exited","exited","exiting", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.feel", "feel","feels","felt","felt","feeling", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.find", "find","finds","found","found","finding", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.fill", "fill","fills","filled","filled","filling", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.occupy", "occupy","occupies","occupied","occupied","occupying", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.repair", "fix","fixes","fixed","fixed","fixing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.follow", "follow","follows","followed","followed","following", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.gather", "gather","gathers","gathered","gathered","gathering", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.get", "get","gets","got","gotten","getting", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.enter", "get in","gets in","got in","gotten in","getting in", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.enter", "get into","gets into","got into","gotten into","getting into", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.enter", "get on","gets on","got on","gotten on","getting on", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.enter", "get onto","gets onto","got onto","gotten onto","getting onto", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.go-to", "get to","gets to","got to","gotten to","getting to", false, multitokens_raw, o);
    this.addStandardVerbPOS("action.give", "give","gives","gave","given","giving", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.go", "head","heads","headed","headed","heading", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.go", "go","goes","went","gone","going", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.leave", "go out of","goes out of","went out of","gone out of","going out of", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.leave", "get out of","gets out of","got out of","gotten out of","getting out of", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.leave", "get outside of","gets outside of","got outside of","gotten outside of","getting outside of", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.leave", "go outside of","goes outside of","went outside of","gone outside of","going outside of", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.go-to", "go into","goes into","went into","gone into","going into", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.go-to", "go to","goes to","went to","gone to","going to", false, multitokens_raw, o);
    this.addStandardVerbPOS("action.take", "grab","grabs","grabbed","grabbed","grabbing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.take-to", "guide","guides","guided","guided","guiding", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.guide", "guide","guides","guided","guided","guiding", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.happen", "happen","happens","happened","happened","happening", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.have", "have","has","had","had","having", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.heal", "heal","heals","healed","healed","healing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.hear", "hear","hears","heard","heared","hearing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.help", "help","helps","helped","helped","helping", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.injure", "injure","injures","injured","injured","injuring", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.keep", "keep","keeps","kept","kept","keeping", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.know", "know","knows","knew","known","knowing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.leave", "leave","leaves","left","left","leaving", false, multitokens_raw, o);
    this.addStandardVerbPOS("action.embark", "embark","embarks","embarked","embarked","embarking", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.enumerate", "list","lists","listed","listed","listing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.seem", "look","looks","looked","looked","looking", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.look-at", "look at","looks at","looked at","looked at","looking at", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.malfunction", "malfunction","malfunctions","malfunctioned","malfunctioned","malfunctioning", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.mean", "mean","means","meant","meant","meaning", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.move", "move","moves","moved","moved","moving", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.need", "need","needs","needed","needed","needing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.obtain", "obtain","obtains","obtained","obtained","obtaining", false, multitokens_raw, o);
    this.addStandardVerbPOS("action.open", "open","opens","opened","opened","opening", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.own", "own","owns","owned","owned","owning", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.supervise", "oversee","oversees","oversaw","overseen","overseeing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.parse", "parse","parses","parsed","parsed","parsing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.allow", "permit","permits","permitted","permitted","permitting", false, multitokens_raw, o);
    this.addStandardVerbPOS("action.take", "pick up","picks up","picked up","picked up","picking up", false, multitokens_raw, o);
    this.addStandardVerbPOS("action.pull", "pull","pulls","pulled","pulled","pulling", false, multitokens_raw, o);
    this.addStandardVerbPOS("action.push", "push","pushes","pushed","pushed","pushing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.put", "put","puts","put","put","putting", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.reach", "reach","reaches","reached","reached","reaching", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.fill", "recharge","recharges","recharged","recharged","recharging", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.remember", "remember","remembers","remembered","remembered","remembering", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.fill", "refill","refills","refilled","refilled","refilling", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.repair", "repair","repairs","repaired","repaired","repairing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.rotate", "turn","turns","turned","turned","turning", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.rotate", "rotate","rotates","rotated","rotated","rotating", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.run", "run","runs","ran","run","running", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.see", "see","sees","saw","seen","seeing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.seem", "seem","seems","seemed","seemed","seeming", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.send", "send","sends","sent","sent","sending", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.shall", "shall","shall","should",null,null, true, multitokens_raw, o);
    this.addStandardVerbPOS("verb.show", "show","shows","showed","shown","showing", true, multitokens_raw, o);
    this.addStandardVerbPOS("verb.sleep", "sleep","sleeps","slept","slept","sleeping", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.stand", "stand","stands","stood","stood","standing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.stop", "stay","stays","stayed","stayed","staying", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.stop", "stop","stops","stopped","stopped","stopping", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.supervise", "supervise","supervises","supervised","supervised","supervising", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.switch", "switch","switches","switched","switched","switching", false, multitokens_raw, o);
    this.addStandardVerbPOS("action.take", "take","takes","took","taken","taking", false, multitokens_raw, o);
    this.addStandardVerbPOS("action.talk", "talk","talks","talked","talked","talking", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.tell", "tell","tells","told","told","telling", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.test", "test","tests","tested","tested","testing", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.thank", "thank","thanks","thanked","thanked","thanking", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.think", "think","thinks","thinked","thinked","thinking", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.try", "try","tries","tried","tried","trying", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.speak", "speak","speaks","spoke","spoke","speaking", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.switch", "turn","turns","turned","turned","turning", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.understand", "understand","understands","understood","understood","understanding", false, multitokens_raw, o);
    this.addStandardVerbPOS("action.use", "use","uses","used","used","using", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.walk", "walk","walks","walked","walked","walking", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.wait", "wait","waits","waited","waited","waiting", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.want", "want","wants","wanted","wanted","wanting", false, multitokens_raw, o);
    this.addStandardVerbPOS("verb.will", "will","will","would",null,null, true, multitokens_raw, o);
    this.addStandardVerbPOS("verb.will", "'ll","'ll","'d",null,null, true, multitokens_raw, o);
    this.addStandardVerbPOS("verb.may", "may","may","might",null,null, true, multitokens_raw, o);

    this.addPhrasalVerbPOS("verb.switch-on","on", "turn","turns","turned","turned","turning", false, multitokens_raw, o);
    this.addPhrasalVerbPOS("verb.switch-off","off", "turn","turns","turned","turned","turning", false, multitokens_raw, o);
    this.addPhrasalVerbPOS("verb.switch-on","on", "switch","switches","switched","switched","switching", false, multitokens_raw, o);
    this.addPhrasalVerbPOS("verb.switch-off","off", "switch","switches","switched","switched","switching", false, multitokens_raw, o);
    this.addPhrasalVerbPOS("action.put-in","in", "put","puts","put","put","putting", false, multitokens_raw, o);
    this.addPhrasalVerbPOS("action.put-in","on", "put","puts","put","put","putting", false, multitokens_raw, o);
    this.addPhrasalVerbPOS("action.put-in","at", "put","puts","put","put","putting", false, multitokens_raw, o);

    // adjectives (synonims) (added first, so NLG does not used them):
    this.addTokenPOS(new PartOfSpeech("odd", "property.strange", Term.fromString("adjective('property.strange'[property.strange])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("abnormal", "property.strange", Term.fromString("adjective('property.strange'[property.strange])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("unusual", "property.strange", Term.fromString("adjective('property.strange'[property.strange])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("suspicious", "property.strange", Term.fromString("adjective('property.strange'[property.strange])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("weird", "property.strange", Term.fromString("adjective('property.strange'[property.strange])", o), 1.0));

    // adjectives:    
    this.addTokenPOS(new PartOfSpeech("alive", "alive", Term.fromString("adjective('alive'[alive])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("alone", "alone", Term.fromString("adjective('alone'[alone])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("awake", "awake", Term.fromString("adjective('awake'[awake])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("big", "big", Term.fromString("adjective('big'[big])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("black", "black", Term.fromString("adjective('black'[black])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("blind", "property.blind", Term.fromString("adjective('property.blind'[property.blind])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("blue", "blue", Term.fromString("adjective('blue'[blue])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("bored", "bored", Term.fromString("adjective('bored'[bored])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("born", "property.born", Term.fromString("adjective('property.born'[property.born])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("bright", "bright", Term.fromString("adjective('bright'[bright])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("broken", "property.broken", Term.fromString("adjective('property.broken'[property.broken])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("charged", "full", Term.fromString("adjective('full'[full])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("cold", "cold", Term.fromString("adjective('cold'[cold])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("dark", "dark", Term.fromString("adjective('dark'[dark])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("dead", "dead", Term.fromString("adjective('dead'[dead])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("depleted", "empty", Term.fromString("adjective('empty'[empty])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("east", "east", Term.fromString("adjective('east'[east])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("else", "else", Term.fromString("adjective('else'[else])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("empty", "empty", Term.fromString("adjective('empty'[empty])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("erased", "erased", Term.fromString("adjective('erased'[erased])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("flat", "shape.flat", Term.fromString("adjective('shape.flat'[shape.flat])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("full", "full", Term.fromString("adjective('full'[full])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("great", "great", Term.fromString("adjective('great'[great])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("green", "green", Term.fromString("adjective('green'[green])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("grey", "grey", Term.fromString("adjective('grey'[grey])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("gray", "grey", Term.fromString("adjective('grey'[grey])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("heavy", "heavy-weight", Term.fromString("adjective('heavy-weight'[heavy-weight])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("healthy", "healthy", Term.fromString("adjective('healthy'[healthy])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("high", "gravity.high", Term.fromString("adjective('gravity.high'[gravity.high])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("hot", "hot", Term.fromString("adjective('hot'[hot])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("huge", "big", Term.fromString("adjective('big'[big])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("human", "human", Term.fromString("adjective('human'[human])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("hungry", "hungry", Term.fromString("adjective('hungry'[hungry])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("in stasis", "in-stasis", Term.fromString("adjective('in-stasis'[in-stasis])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("large", "big", Term.fromString("adjective('big'[big])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("large", "length.large", Term.fromString("adjective('length.large'[length.large])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("last", "last", Term.fromString("adjective('last'[last])", o), 1.0));
//    this.addTokenPOS(new PartOfSpeech("later", "time.later", Term.fromString("adjective('time.later'[time.later])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("light", "light-weight", Term.fromString("adjective('light-weight'[light-weight])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("long", "long", Term.fromString("adjective('long'[long])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("low", "low", Term.fromString("adjective('low'[low])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("low", "gravity.low", Term.fromString("adjective('gravity.low'[gravity.low])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("luminiscent", "luminiscent", Term.fromString("adjective('luminiscent'[luminiscent])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("medium", "size.medium", Term.fromString("adjective('size.medium'[size.medium])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("medium", "fill.medium", Term.fromString("adjective('fill.medium'[fill.medium])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("mortal", "mortal", Term.fromString("adjective('mortal'[mortal])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("north", "north", Term.fromString("adjective('north'[north])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("old", "property.old", Term.fromString("adjective('property.old'[property.old])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("on", "powered.on", Term.fromString("adjective('powered.on'[powered.on])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("open", "property.opened", Term.fromString("adjective('property.opened'[property.opened])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("off", "powered.off", Term.fromString("adjective('powered.off'[powered.off])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("orange", "orange", Term.fromString("adjective('orange'[orange])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("permanent", "time.permanent", Term.fromString("adjective('time.permanent'[time.permanent])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("purple", "purple", Term.fromString("adjective('purple'[purple])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("red", "red", Term.fromString("adjective('red'[red])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("short", "short", Term.fromString("adjective('short'[short])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("sick", "sick", Term.fromString("adjective('sick'[sick])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("sighted", "property.sighted", Term.fromString("adjective('property.sighted'[property.sighted])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("small", "small", Term.fromString("adjective('small'[small])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("south", "south", Term.fromString("adjective('south'[south])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("strange", "property.strange", Term.fromString("adjective('property.strange'[property.strange])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("strong", "strength", Term.fromString("adjective('strength'[strength])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("sure", "sure", Term.fromString("adjective('sure'[sure])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("thirsty", "thirsty", Term.fromString("adjective('thirsty'[thirsty])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("tiny", "small", Term.fromString("adjective('small'[small])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("uncharged", "empty", Term.fromString("adjective('empty'[empty])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("yellow", "yellow", Term.fromString("adjective('yellow'[yellow])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("west", "west", Term.fromString("adjective('west'[west])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("white", "white", Term.fromString("adjective('white'[white])", o), 1.0));

    this.addTokenPOS(new PartOfSpeech("larger", "relation.larger", Term.fromString("adjective('relation.larger'[relation.larger])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("smaller", "relation.smaller", Term.fromString("adjective('relation.smaller'[relation.smaller])", o), 1.0));

    // adverbs
    this.addTokenPOS(new PartOfSpeech("here", "space.here", Term.fromString("adverb('space.here'[space.here])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("there", "space.there", Term.fromString("adverb('space.there'[space.there])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("aside", "space.away", Term.fromString("adverb('space.away'[space.away])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("away", "space.away", Term.fromString("adverb('space.away'[space.away])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("forward", "forward", Term.fromString("adverb('forward'[forward])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("straight", "forward", Term.fromString("adverb('forward'[forward])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("backward", "backward", Term.fromString("adverb('backward'[backward])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("backwards", "backward", Term.fromString("adverb('backward'[backward])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("left", "direction.left", Term.fromString("adverb('direction.left'[direction.left])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("right", "direction.right", Term.fromString("adverb('direction.right'[direction.right])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("before", "time.past", Term.fromString("adverb('time.past'[time.past])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("in the past", "time.past", Term.fromString("adverb('time.past'[time.past])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("out of the way", "space.away", Term.fromString("adverb('space.away'[space.away])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("out of here", "space.away", Term.fromString("adverb('space.away'[space.away])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("later", "time.later", Term.fromString("adverb('time.later'[time.later])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("never", "time.never", Term.fromString("adverb('time.never'[time.never])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("right now", "time.now", Term.fromString("adverb('time.now'[time.now])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("now", "time.now", Term.fromString("adverb('time.now'[time.now])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("outside", "space.outside", Term.fromString("adverb('space.outside'[space.outside])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("today", "time.today", Term.fromString("adverb('time.today'[time.today])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("yesterday", "time.yesterday", Term.fromString("adverb('time.yesterday'[time.yesterday])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("so", "in-the-same-way", Term.fromString("adverb('in-the-same-way'[in-the-same-way])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("subsequently", "time.subsequently", Term.fromString("adverb('time.subsequently'[time.subsequently])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("then", "time.subsequently", Term.fromString("adverb('time.subsequently'[time.subsequently])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("after that", "time.subsequently", Term.fromString("adverb('time.subsequently'[time.subsequently])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("a bit", "small-amount", Term.fromString("adverb('small-amount'[small-amount])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("a little bit", "small-amount", Term.fromString("adverb('small-amount'[small-amount])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("a tiny bit", "small-amount", Term.fromString("adverb('small-amount'[small-amount])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech("slightly", "small-amount", Term.fromString("adverb('small-amount'[small-amount])", o), 1.0));
    


    this.generateMultitokenTable(multitokens_raw);

    // reverse relations:
    this.reverseRelations["relation.owns"] = "relation.belongs";
    this.reverseRelations["relation.belongs"] = "relation.owns";
    this.reverseRelations["relation.cause"] = "relation.effect";
    this.reverseRelations["relation.effect"] = "relation.cause";
    this.reverseRelations["relation.contains"] = "space.inside.of";
    this.reverseRelations["space.at"] = "relation.contains";
    this.reverseRelations["space.inside.of"] = "relation.contains";

    // generate the sort to English table
    this.generateTypeSortToEnglishTable(o);
    this.generatePropertySortToEnglishTable(o);
    this.generateRelationSortToEnglishTable(o);
    this.generateVerbSortToEnglishTable(o);
    this.generateNounSortToEnglishTable();
    this.generatePronounSortToEnglishTable(o);
    this.generateDeterminerSortToEnglishTable(o);
    this.generateAdverbSortToEnglishTable(o);

    // count how many POS entries we have:
    var count:number = 0;
    for(let t in this.POS) {
      count += this.POS[t].length;
    }
    console.log("POS entries: " + count);
    console.log("Inverse POS entries: " + (Object.keys(this.typeSortToEnglish).length + 
                                           Object.keys(this.propertySortToEnglish).length + 
                                           Object.keys(this.relationSortToEnglish).length +
                                           Object.keys(this.verbSortToEnglish).length +
                                           Object.keys(this.nounSortToEnglish).length + 
                                           Object.keys(this.pronounSortToEnglish).length + 
                                           Object.keys(this.determinerSortToEnglish).length + 
                                           Object.keys(this.adverbSortToEnglish).length));
  }


  isCountable(word:string) 
  {
    var pos_l:PartOfSpeech[] = this.POS[word];
    if (pos_l == null) return true;
    for(let pos of pos_l) {
      if (pos.term.functor.name == "noun" &&
          pos.term.attributes.length >= 2) {
        if (pos.term.attributes[1].sort.name == "uncountable") return false;
      }
    }

    return true;
  }


  addTokenPOS(pos:PartOfSpeech)
  {
    // o.getSort(pos.sortName);  // this is just to check that we have all the sorts!
    var pos_l:PartOfSpeech[] = this.POS[pos.token];
    if (pos_l == null) pos_l = [];
    pos_l.push(pos);
    this.POS[pos.token] = pos_l;

    var pos_ls:PartOfSpeech[] = this.POSbySort[pos.token];
    if (pos_ls == null) pos_ls = [];
    pos_ls.push(pos);
    this.POSbySort[pos.sortName] = pos_ls;
  }


  addStandardNounPOS(noun:string, sortName:string, o:Ontology)
  {
    o.getSort(sortName);  // this is just to check that we have all the sorts!
    this.addTokenPOS(new PartOfSpeech(noun, sortName, Term.fromString("noun('"+sortName+"'["+sortName+"], [singular])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech(noun+"s", sortName, Term.fromString("noun('"+sortName+"'["+sortName+"], [plural])", o), 1.0));
  }


  addUncountableNounPOS(noun:string, sortName:string, o:Ontology)
  {
    o.getSort(sortName);  // this is just to check that we have all the sorts!
    this.addTokenPOS(new PartOfSpeech(noun, sortName, Term.fromString("noun('"+sortName+"'["+sortName+"], [uncountable])", o), 1.0));
  }


  addStandardVerbPOS(sortStr:string, inf:string, present3:string, past:string, participle:string, gerund:string, modal:boolean, multitokens:string[], o:Ontology)
  {
    /*
    // this messes up the parser when I set up to prefer multitokens, since "to X" prevents parsing "to" as a preposition...
    if (!modal) {
      this.addTokenPOS(new PartOfSpeech("to " + inf, sortStr, Term.fromString("verb('"+sortStr+"'[symbol], [grammatical-number], [no-person], [infinitive-tense])", o), 1.0));
      multitokens.push("to " + inf);
    }
    */
    this.addTokenPOS(new PartOfSpeech(inf, sortStr, Term.fromString("verb('"+sortStr+"'[symbol], [grammatical-number], [no-person], [infinitive-tense])", o), 1.0));
    if (gerund!=null) this.addTokenPOS(new PartOfSpeech(gerund, sortStr, Term.fromString("verb('"+sortStr+"'[symbol], [grammatical-number], [no-person], [gerund-tense])", o), 1.0));
    if (participle!=null) {
      this.addTokenPOS(new PartOfSpeech(participle, sortStr, Term.fromString("verb('"+sortStr+"'[symbol], [grammatical-number], [no-person], [participle-tense])", o), 1.0));
      if (o.getSortSilent("property."+participle) != null) {
        this.addTokenPOS(new PartOfSpeech(participle, "property."+participle, Term.fromString("adjective('property."+participle+"'[symbol])", o), 1.0));
      }
    }

    this.addTokenPOS(new PartOfSpeech(inf, sortStr, Term.fromString("verb('"+sortStr+"'[symbol], [grammatical-number], [first-person], [present-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech(inf, sortStr, Term.fromString("verb('"+sortStr+"'[symbol], [grammatical-number], [second-person], [present-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech(present3, sortStr, Term.fromString("verb('"+sortStr+"'[symbol], [singular], [third-person], [present-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech(inf, sortStr, Term.fromString("verb('"+sortStr+"'[symbol], [plural], [third-person], [present-tense])", o), 1.0));

    this.addTokenPOS(new PartOfSpeech(past, sortStr, Term.fromString("verb('"+sortStr+"'[symbol], [grammatical-number], [first-person], [past-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech(past, sortStr, Term.fromString("verb('"+sortStr+"'[symbol], [grammatical-number], [second-person], [past-tense])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech(past, sortStr, Term.fromString("verb('"+sortStr+"'[symbol], [grammatical-number], [third-person], [past-tense])", o), 1.0));

    if (inf!=null && inf.indexOf(" ")>=0) multitokens.push(inf);
    if (present3!=null && present3.indexOf(" ")>=0) multitokens.push(present3);
    if (past!=null && past.indexOf(" ")>=0) multitokens.push(past);
    if (participle!=null && participle.indexOf(" ")>=0) multitokens.push(participle);
    if (gerund!=null && gerund.indexOf(" ")>=0) multitokens.push(gerund);
  }


  addPhrasalVerbPOS(sortStr:string, preposition:string, inf:string, present3:string, past:string, participle:string, gerund:string, modal:boolean, multitokens:string[], o:Ontology)
  {
    /*
    // this messes up the parser when I set up to prefer multitokens, since "to X" prevents parsing "to" as a preposition...
    if (!modal) {
      this.addTokenPOS(new PartOfSpeech("to " + inf, sortStr, Term.fromString("verb('"+sortStr+"'[symbol], [grammatical-number], [no-person], [infinitive-tense])", o), 1.0));
      multitokens.push("to " + inf);
    }
    */
    this.addTokenPOS(new PartOfSpeech(inf, sortStr, Term.fromString("phrasal-verb('"+sortStr+"'[symbol], [grammatical-number], [no-person], [infinitive-tense], '"+preposition+"'[symbol])", o), 1.0));
    if (gerund!=null) this.addTokenPOS(new PartOfSpeech(gerund, sortStr, Term.fromString("verb('"+sortStr+"'[symbol], [grammatical-number], [no-person], [gerund-tense], '"+preposition+"'[symbol])", o), 1.0));
    if (participle!=null) {
      this.addTokenPOS(new PartOfSpeech(participle, sortStr, Term.fromString("phrasal-verb('"+sortStr+"'[symbol], [grammatical-number], [no-person], [participle-tense], '"+preposition+"'[symbol])", o), 1.0));
      if (o.getSortSilent("property."+participle) != null) {
        this.addTokenPOS(new PartOfSpeech(participle, "property."+participle, Term.fromString("adjective('property."+participle+"'[symbol], '"+preposition+"'[symbol])", o), 1.0));
      }
    }

    this.addTokenPOS(new PartOfSpeech(inf, sortStr, Term.fromString("phrasal-verb('"+sortStr+"'[symbol], [grammatical-number], [first-person], [present-tense], '"+preposition+"'[symbol])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech(inf, sortStr, Term.fromString("phrasal-verb('"+sortStr+"'[symbol], [grammatical-number], [second-person], [present-tense], '"+preposition+"'[symbol])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech(present3, sortStr, Term.fromString("phrasal-verb('"+sortStr+"'[symbol], [singular], [third-person], [present-tense], '"+preposition+"'[symbol])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech(inf, sortStr, Term.fromString("phrasal-verb('"+sortStr+"'[symbol], [plural], [third-person], [present-tense], '"+preposition+"'[symbol])", o), 1.0));

    this.addTokenPOS(new PartOfSpeech(past, sortStr, Term.fromString("phrasal-verb('"+sortStr+"'[symbol], [grammatical-number], [first-person], [past-tense], '"+preposition+"'[symbol])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech(past, sortStr, Term.fromString("phrasal-verb('"+sortStr+"'[symbol], [grammatical-number], [second-person], [past-tense], '"+preposition+"'[symbol])", o), 1.0));
    this.addTokenPOS(new PartOfSpeech(past, sortStr, Term.fromString("phrasal-verb('"+sortStr+"'[symbol], [grammatical-number], [third-person], [past-tense], '"+preposition+"'[symbol])", o), 1.0));

    if (inf!=null && inf.indexOf(" ")>=0) multitokens.push(inf);
    if (present3!=null && present3.indexOf(" ")>=0) multitokens.push(present3);
    if (past!=null && past.indexOf(" ")>=0) multitokens.push(past);
    if (participle!=null && participle.indexOf(" ")>=0) multitokens.push(participle);
    if (gerund!=null && gerund.indexOf(" ")>=0) multitokens.push(gerund);
  }


  generateCardinalNumber(token:string, o:Ontology) : PartOfSpeech  
  {
    return new PartOfSpeech(token, token, Term.fromString("cardinal('"+token+"'[number])", o), 1.0)
  }


  tokenize(text:string) : string[]
  {
    var tokens:string[] = this.basicTokenization(text);
    // detect numbers: 
    //    - pattern [number, ".", number]
    for(let i:number = 0;i<tokens.length-2;i++) {
        if (!isNaN(Number(tokens[i])) &&
            tokens[i+1] == "." &&
            !isNaN(Number(tokens[i+2]))) {
            tokens[i] = tokens[i] + "." + tokens[i+2];
            tokens.splice(i+1,2);
        }
    }

    // informal language contractions:
    for(let i:number = 0;i<tokens.length;i++) {
      if (tokens[i] == "whats") {
        tokens[i] = "what";
        tokens.splice(i+1, 0, "is");
      }
      if (tokens[i] == "arent") {
        tokens[i] = "are";
        tokens.splice(i+1, 0, "not");
      }
      if (tokens[i] == "dont") {
        tokens[i] = "do";
        tokens.splice(i+1, 0, "not");
      }
      if (tokens[i] == "isnt") {
        tokens[i] = "is";
        tokens.splice(i+1, 0, "not");
      }
    }

    // detect Enclictics:
    //    - pattern: ["'", "s" , " "]
    //    - pattern: ["'", "m" , " "]
    //    - pattern: ["'", "ll" , " "]
    //    - pattern: ["'", "re" , " "]
    //    - pattern: ["'", "ve" , " "]
    //    - pattern: ["'", "d" , " "]
    for(let i:number = 0;i<tokens.length-1;i++) {
        if (tokens[i] == "'" &&
            (tokens[i+1] == "s" || 
             tokens[i+1] == "m" || 
             tokens[i+1] == "ll" || 
             tokens[i+1] == "re" || 
             tokens[i+1] == "ve" || 
             tokens[i+1] == "d") &&
            (i == tokens.length-2 || tokens[i+2] == " " ||
             tokens[i+2] == "." || tokens[i+2] == "," ||
             tokens[i+2] == "!" || tokens[i+2] == "?")) {            
            tokens[i] = tokens[i] + tokens[i+1];
            tokens.splice(i+1,1);
        }
    }

    for(let i:number = 0;i<tokens.length-2;i++) {
        if (tokens[i] == "don" &&
            tokens[i+1] == "'" &&
            tokens[i+2] == "t") {
            tokens[i] = "do";
            tokens[i+1] = "not";
            tokens.splice(i+2,1);
        }
    }    

    for(let i:number = 0;i<tokens.length;i++) {
        if (tokens[i] == "cannot") {
            tokens[i] = "can";
            tokens.splice(i+1,0,"not");
        }
    }    

    for(let i:number = 0;i<tokens.length;i++) {
        if (tokens[i] == "can" &&
            tokens[i+1] == "'" &&
            tokens[i+2] == "t") {
            tokens[i] = "can";
            tokens[i+1] = "not";
            tokens.splice(i+2,1);
        }
    }    

    //  pattern: ["O", "'", "clock" , " "]
    for(let i:number = 0;i<tokens.length-2;i++) {
        if (tokens[i] == "o" &&
            tokens[i+1] == "'" &&
            tokens[i+2] == "clock" &&
            (i == tokens.length-3 || tokens[i+3] == " ")) {
            tokens[i] = tokens[i] + tokens[i+1] + tokens[i+2];
            tokens.splice(i+1,2);
        }
    }

    //  times that are written compacted: 1pm, 3am, etc.
    for(let i:number = 0;i<tokens.length;i++) {
        if (tokens[i].length>2 && 
            (tokens[i].substring(tokens[i].length-2)=="pm" ||
             tokens[i].substring(tokens[i].length-2)=="am") && 
             !isNaN(Number(tokens[i].substring(0,tokens[i].length-2)))) {
            var tmp:string = tokens[i];
            tokens[i] = tmp.substring(0,tmp.length-2);
            tokens.splice(i+1,0,tmp.substring(tmp.length-2, tmp.length));
        }
    }

    // Remove spaces
    var finalTokens:string[] = [];
    for(let t of tokens) {
        if (t != " ") finalTokens.push(t);
    }
    return finalTokens;
  }


  basicTokenization(text:string) : string[]
  {
    var normal:string="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRTSUVWXYZ0123456789";
    var tokenSeparators:string=".,!-;:'\"?";
    var ignorableSeparators:string=" \t\n\r";
    
    var tokens:string[] = [];
    var token:string = "";
    for(let i:number = 0;i<text.length;i++) {
        if (normal.indexOf(text.charAt(i))>=0) {
            token += text.charAt(i)
        } else {
            if (token != "") tokens.push(token.toLowerCase());
            if (tokenSeparators.indexOf(text.charAt(i))>=0) {
                tokens.push(text.charAt(i));
            } else if (ignorableSeparators.indexOf(text.charAt(i))>=0) {
                tokens.push(" ");
            } else {
                console.error("NLPTokenizer: ignoring character '" + text.charAt(i) + "'");
            }
            token = "";
        }
    }
    if (token != "") tokens.push(token.toLowerCase());

    return tokens;
  }


  generateMultitokenTable(multitokens_raw:string[])
  {
    for(let mt of multitokens_raw) {
      this.addMultiToken(mt);
    }
  }


  addMultiToken(mt:string)
  {
    var tokens:string[] = mt.split(" ");
    if (tokens.length == 1) return;  // not a multitoken!
    var key:string = tokens[0];
    var value:string[] = tokens.slice(1);
    var values:string[][] = this.multitokens[key];
    if (values==null) values = [];
    if(values.indexOf(value) == -1) {
      values.push(value);
      this.multitokens[key] = values;    
    }
  }


  identifyMultiTokenWords(tokens:string[]) : TokenizationElement
  {
    if (tokens==null) return null;

    var tokenization:TokenizationElement = new TokenizationElement(null);
    var t:TokenizationElement = tokenization;
    var preferLongerMultiTokens:boolean = true;  // preference for multitoken words! remove this line if you want all parses to be returned
//    var preferLongerMultiTokens:boolean = false; 
    for(let i:number = 0;i<tokens.length;i++) {
      var options:string[][] = this.multitokens[tokens[i]];
      var found:boolean = false;
      var longestMultiToken:number = 0;
      var bestTokenization:TokenizationElement = null;
      if (options!=null) {
        for(let option of options) {
          found = true;
          for(let j:number = 0;j<option.length;j++) {
            if (tokens[i+j+1] != option[j]) {
              found = false;
              break;
            }
          }
          if (found) {
            var newToken:string = tokens[i];
            for(let t of option) newToken += " " + t;
            if (preferLongerMultiTokens) {
              if (option.length > longestMultiToken) {
                longestMultiToken = option.length;
                bestTokenization = this.identifyMultiTokenWords(tokens.slice(i+option.length+1,tokens.length));
                bestTokenization.token = newToken;
              }
            } else {
              var t2:TokenizationElement = this.identifyMultiTokenWords(tokens.slice(i+option.length+1,tokens.length));
              t2.token = newToken;
              t.next.push(t2)
            }
          }
        }
        if (bestTokenization!=null) {
            t.next.push(bestTokenization)
            return tokenization;
        }
      }
      var t2:TokenizationElement = new TokenizationElement(tokens[i]);
      t.next.push(t2);
      t = t2;
    }

    return tokenization;
  }


  tagToken(token:string, o:Ontology) : PartOfSpeech[]
  {
      var pos_l:PartOfSpeech[] = this.POS[token];
      if (pos_l != null) {
        // we found it!
        var pos_l2:PartOfSpeech[] = [];
        for(let pos of pos_l) {
          var pos2:PartOfSpeech = PartOfSpeech.fromPartOfSpeech(pos);
          pos2.token = token;
          pos_l2.push(pos2);
        }
        return pos_l2;
      } else if (!isNaN(Number(token))) {
        // numbers:
        var pos2:PartOfSpeech = this.generateCardinalNumber(token, o);

        pos2.token = token;
        return [pos2];
      } else {
        if (token.indexOf("'") == -1) {
          // not found in the dictionary,assume it's a proper noun (but give a warning):
          this.unrecognizedTokens.push(token);
          console.warn("NLPPOSTagging: unknown token: '" + token + "', assuming proper noun");
          return [new PartOfSpeech(token, token, Term.fromString("proper-noun('"+token+"'[symbol], [singular])", o), 1.0)];
        } else {
          return null;
        }
      }
  }


  POSTagging(tokens:TokenizationElement, o:Ontology)
  {
    // tag all the tokens in the tokenization:
    this.POSTaggingInternal(tokens, o);

    // remove all the paths with a failed tokenization (at least one token not recognized)
    var failedTokens:string[] = [];
    if (!this.removeFailedPOSTaggingPaths(tokens, failedTokens)) {
      console.error(failedTokens);
    }
  }



  POSTaggingInternal(tokens:TokenizationElement, o:Ontology)
  {
    if (tokens.token!=null) tokens.POS = this.tagToken(tokens.token, o);
    for(let t of tokens.next) {
      this.POSTaggingInternal(t, o);
    }
  }


  POSTaggingArray(tokens:string[], o:Ontology) : PartOfSpeech[][]
  {
    var l:PartOfSpeech[][] = [];

    for(let token of tokens) {
      var pos_l:PartOfSpeech[] = this.tagToken(token, o);
      l.push(pos_l);
    }

    return l;
  }


  removeFailedPOSTaggingPaths(tokens:TokenizationElement, failedTokens:string[]) : boolean
  {
    if (tokens.token != null) {
      if (tokens.POS == null || tokens.POS.length == 0) {
        if (failedTokens.indexOf(tokens.token)==-1) failedTokens.push(tokens.token);
  //      console.log("failed: " + tokens.token);
        return false;
      }
      if (tokens.next == null || tokens.next.length == 0) {
  //      console.log("end: " + true);
        return true;
      }
    }

  //  console.log("token: " + tokens.token + " next: " + tokens.next.length);

    var atLeastOneSucceeds:boolean = false;
    var toDelete:TokenizationElement[] = [];
    for(let t of tokens.next) {
      if (this.removeFailedPOSTaggingPaths(t, failedTokens)) {
        atLeastOneSucceeds = true;
      } else {
        toDelete.push(t);
      }
    }
    for(let t of toDelete) {
      var idx:number = tokens.next.indexOf(t);
      if (idx>=0) tokens.next.splice(idx,1);
    }
    return atLeastOneSucceeds;
  }  


  static sortIsConsideredForTypes(s:Sort, o:Ontology)
  {

    for(let sName of POSParser.sortsToConsiderForTypes) {
      if (s.is_a(o.getSort(sName))) return true;
    }
    return false;
  }


  generateTypeSortToEnglishTable(o:Ontology)
  {
    for(let token in this.POS) {

      // prevent synonims to overwrite the core words to be used for NLG:  
      if (token == "person" ||
          token == "persons" ||
          token == "people") {
          continue;
      }

      var POS_l:PartOfSpeech[] = this.POS[token];
      for(let POS of POS_l) {
        var sort:Sort = o.getSortSilent(POS.sortName);
        if (sort != null) {
          if (POS.term.functor.name == "noun" &&
              POSParser.sortIsConsideredForTypes(sort, o))  {
            var tmp:string[] = this.typeSortToEnglish[POS.sortName];
            if (tmp==null) {
              tmp = [null,null];
              this.typeSortToEnglish[POS.sortName] = tmp;
            }
            var number:number = 0;
            if (POS.term.attributes[1].sort.name == "plural") number = 1;
            tmp[number] = token;
            //console.log(POS.sortName + "[" + number + "] = " + token);
          }
        }
      }
    }
  }


  generatePropertySortToEnglishTable(o:Ontology)
  {
    var propertySort:Sort = o.getSort("property");
    for(let token in this.POS) {
      var POS_l:PartOfSpeech[] = this.POS[token];
      for(let POS of POS_l) {
        var sort:Sort = o.getSortSilent(POS.sortName);
        if (sort != null) {
          if ((POS.term.functor.name == "adjective" ||
               POS.term.functor.name == "preposition") &&
              sort.is_a(propertySort))  {
            this.propertySortToEnglish[POS.sortName] = token;
            //console.log(POS.sortName + " = " + token);
          }
        }
      }
    }
  }


  generateRelationSortToEnglishTable(o:Ontology)
  {
    var relationSort:Sort = o.getSort("relation");
    for(let token in this.POS) {
      var POS_l:PartOfSpeech[] = this.POS[token];
      for(let POS of POS_l) {
        var sort:Sort = o.getSortSilent(POS.sortName);
        if (sort != null) {
          if (POS.term.functor.name == "preposition" &&
              sort.is_a(relationSort))  {
            this.relationSortToEnglish[POS.sortName] = token;
            //console.log(POS.sortName + " =(relation)= " + token);
          }
        }
      }
    }
  }


  generateNounSortToEnglishTable()
  {
    for(let token in this.POS) {
      // prevent synonims to overwrite the core words to be used for NLG:  
      if (token == "person" ||
          token == "persons" ||
          token == "people") {
          continue;
      }

      var POS_l:PartOfSpeech[] = this.POS[token];
      for(let POS of POS_l) {
        if (POS.term.functor.name == "noun")  {
          var tmp:string[] = this.nounSortToEnglish[POS.sortName];
          if (tmp==null) {
            tmp = [null,null];
            this.nounSortToEnglish[POS.sortName] = tmp;
          }
          var number:number = 0;
          if (POS.term.attributes[1].sort.name == "plural") number = 1;
          tmp[number] = token;
          //console.log(POS.sortName + "[" + number + "] = " + token);
        }
      }
    }
  }


  generateVerbSortToEnglishTable(o:Ontology)
  {
    for(let token in this.POS) {
      var POS_l:PartOfSpeech[] = this.POS[token];
      for(let POS of POS_l) {
        var sort:Sort = o.getSortSilent(POS.sortName);
        if (sort != null) {
          if (POS.term.functor.name == "verb" ||
              POS.term.functor.name == "phrasal-verb")  {
            // "verb('verb.be'[symbol], [singular], [first-person], [present-tense])
            var number:number = null;
            var person:number = null;
            var tense:number = null;
            if (POS.term.attributes[1].sort.name == "singular") number = 0;
            if (POS.term.attributes[1].sort.name == "plural") number = 1;
            if (POS.term.attributes[2].sort.name == "first-person") person = 0;
            if (POS.term.attributes[2].sort.name == "second-person") person = 1;
            if (POS.term.attributes[2].sort.name == "third-person") person = 2;
            if (POS.term.attributes[3].sort.name == "infinitive-tense") tense = 0;
            if (POS.term.attributes[3].sort.name == "gerund-tense") tense = 1;
            if (POS.term.attributes[3].sort.name == "participle-tense") tense = 2;
            if (POS.term.attributes[3].sort.name == "present-tense") tense = 3;
            if (POS.term.attributes[3].sort.name == "past-tense") tense = 4;

            if (tense != null) {
              var idxs:number[] = [];
              if (tense < 3) {
                idxs = [tense];
              } else {
                idxs = [3 + (tense-3)*6];
                var idxs2:number[] = [];
                for(let idx of idxs) {
                  if (number == null || number==0) idxs2.push(idx);
                  if (number == null || number==1) idxs2.push(idx+3);
                }
                idxs = [];
                for(let idx of idxs2) {
                  if (person == null || person==0) idxs.push(idx);
                  if (person == null || person==1) idxs.push(idx+1);
                  if (person == null || person==2) idxs.push(idx+2);
                }
              }

              var tmp:string[] = this.verbSortToEnglish[POS.sortName];
              if (tmp==null) {
                tmp = [null,null,null, 
                       null,null,null,null,null,null, 
                       null,null,null,null,null,null];
                this.verbSortToEnglish[POS.sortName] = tmp;
              }

              for(let idx of idxs) {
                // do not add the "to XXX" forms of infinitive
                if (idx == 0 && 
                    token.length>3 &&
                    token[0] =='t' &&
                    token[1] =='o' &&
                    token[2] ==' ') continue;
                if (POS.term.functor.name == "phrasal-verb") {
                  tmp[idx] = token + " " + (<ConstantTermAttribute>POS.term.attributes[4]).value;
                } else {
                  tmp[idx] = token;
                }
              }
//              console.log(POS.sortName + " =(verb)= " + token + " [" + idxs + "]");
            } else {
              console.error("No tense specified in " + POS.term);
            }
          }
        }
      }
    }
  }


  generatePronounSortToEnglishTable(o:Ontology)
  {
    for(let token in this.POS) {
      var POS_l:PartOfSpeech[] = this.POS[token];
      for(let POS of POS_l) {
        if (POS.term.functor.is_a(o.getSort("pronoun")))  {
          var tmp:string[][] = this.pronounSortToEnglish[POS.sortName];
          if (tmp==null) {
            tmp = [[null,null,null],[null,null,null]];
            this.pronounSortToEnglish[POS.sortName] = tmp;
          }
          var numbers:number[] = [];
          var genders:number[] = [];

          if (POS.term.attributes[1].sort.name == "singular") numbers = [0];
          else if (POS.term.attributes[1].sort.name == "plural") numbers = [1];
          else numbers = [0,1];

          if (POS.term.attributes[2].sort.name == "gender-masculine") genders = [0];
          else if (POS.term.attributes[2].sort.name == "gender-femenine") genders = [1];
          else if (POS.term.attributes[2].sort.name == "gender-neutral") genders = [2];
          else genders = [0,1,2];

          for(let gender of genders) {
            for(let num of numbers) {
              tmp[num][gender] = token;
            }
          }
        }
      }
    }
  }  


  generateDeterminerSortToEnglishTable(o:Ontology)
  {
    for(let token in this.POS) {
      var POS_l:PartOfSpeech[] = this.POS[token];
      for(let POS of POS_l) {
        if (POS.term.functor.is_a(o.getSort("determiner")))  {
          var tmp:string[] = this.determinerSortToEnglish[POS.sortName];
          if (tmp==null) {
            tmp = [null,null];
            this.determinerSortToEnglish[POS.sortName] = tmp;
          }
          if (POS.term.attributes[1].sort.name == "singular") tmp[0] = token;
          else if (POS.term.attributes[1].sort.name == "plural") tmp[1] = token;
          else {
            tmp[0] = token;
            tmp[1] = token;
          }
        }
      }
    }
  }  


  generateAdverbSortToEnglishTable(o:Ontology)
  {
    for(let token in this.POS) {
      var POS_l:PartOfSpeech[] = this.POS[token];
      for(let POS of POS_l) {
        var sort:Sort = o.getSortSilent(POS.sortName);
        if (sort != null) {
          if (POS.term.functor.name == "adverb")  {
            this.adverbSortToEnglish[POS.sortName] = token;
            //console.log(POS.sortName + " = " + token);
          }
        }
      }
    }
  }


  isPhrasalVerb(s:Sort) : PartOfSpeech
  {
    var l:PartOfSpeech[] = this.POSbySort[s.name];
    for(let pos of l) {
      if (pos.term.functor.name == "phrasal-verb") return pos;
    }
    return null;
  }


  sortCanBe(s:Sort, grammaticalFunction:Sort) : boolean
  {
    var l:PartOfSpeech[] = this.POSbySort[s.name];
    if (l!=null) {
      for(let pos of l) {
        if (pos.term.functor.is_a(grammaticalFunction)) return true;
      }
    }
    return false;
  }


  // number: 0 = singular, 1 = plural
  getTypeString(s:Sort, number:number) : string
  {
    var tmp:string[] = this.typeSortToEnglish[s.name];
    if (tmp == null) return null;
    return tmp[number];
  }


  // number: 0 = singular, 1 = plural
  getNounString(s:Sort, number:number, tryAncestors:boolean) : string
  {
    let tmp:string[] = this.nounSortToEnglish[s.name];
    if (tmp == null) {
      if (tryAncestors) {
        var sort_l:Sort[] = s.getAncestors();
        for(let ts of sort_l) {
          let word:string = this.getNounString(ts, 0, false);
          if (word != null) return word;
        }
      }
      return null;
    }
    return tmp[number];
  }


  getPropertyString(s:Sort) : string
  {
    var tmp:string = this.propertySortToEnglish[s.name];
    return tmp;
  }


  getRelationString(s:Sort) : string
  {
    var tmp:string = this.relationSortToEnglish[s.name];
    return tmp;
  }


  getVerbString(s:Sort, number:number, person:number, tense:number) : string
  {
    var tmp:string[] = this.verbSortToEnglish[s.name];
    var idx:number = tense;
    if (tense>=3) {
      idx = 3 + (tense-3)*6 + number*3 + person;
    }
    if (tmp == null) {
      console.error("getVerbString: cannot render verb " + s)
      return null;
    }
//    console.log("getVerbString("+s.name+", " + idx + " = (" + number + ", " + person + ", " + tense + ") : " + tmp);
    return tmp[idx];
  }


  getPronounString(s:Sort, number:number, gender:number) : string
  {
    var tmp:string[][] = this.pronounSortToEnglish[s.name];
    if (tmp == null) return null;
    return tmp[number][gender];
  }


  getPronounStringString(s:string, number:number, gender:number) : string
  {
//    console.log("s: " + s + ", number: " + number + ", gender: " + gender);
    var tmp:string[][] = this.pronounSortToEnglish[s];
    if (tmp == null) return null;
    return tmp[number][gender];
  }


  getDeterminerString(s:Sort, number:number) : string
  {
    var tmp:string[] = this.determinerSortToEnglish[s.name];
    if (tmp == null) return null;
    return tmp[number];
  }


  getAdverbString(s:Sort) : string
  {
    var tmp:string = this.adverbSortToEnglish[s.name];
    return tmp;
  }


  multitokens: { [first: string] : string[][]; } = {};
  POS:{[token:string]:PartOfSpeech[];} = {}; 
  POSbySort:{[sort:string]:PartOfSpeech[];} = {};

  typeSortToEnglish:{[sort:string] : string[];} = {};  // it maps to two strings: for sigular, plural
  propertySortToEnglish:{[sort:string] : string;} = {};
  relationSortToEnglish:{[sort:string] : string;} = {};
  verbSortToEnglish:{[sort:string] : string[];} = {};
  nounSortToEnglish:{[sort:string] : string[];} = {};
  pronounSortToEnglish:{[sort:string] : string[][];} = {};
  determinerSortToEnglish:{[sort:string] : string[];} = {};
  adverbSortToEnglish:{[sort:string] : string;} = {};

  // for example, "owns" is the reverse relation of "belongs"
  reverseRelations: { [first: string] : string; } = {};

  unrecognizedTokens:string [] = [];


  static sortsToConsiderForTypes:string[] = ["object", 
                                             "time.location",
                                             "space.location", 
                                             "abstract-entity", 
                                             "role",
                                             "event"];

}

