class RobotPutIn_IntentionAction extends IntentionAction {

	canHandle(intention:Term, ai:RuleBasedAI) : boolean
	{
		if (intention.functor.is_a(ai.o.getSort("action.put-in"))) return true;
		return false;
	}


	execute(ir:IntentionRecord, ai_raw:RuleBasedAI) : boolean
	{
		let ai:RobotAI = <RobotAI>ai_raw;
		let intention:Term = ir.action;
		let requester:TermAttribute = ir.requester;

		if (ai.robot.isInVehicle()) {
			if (requester != null) {
				let term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
				ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
			}
			return true;
		}			

		if (intention.attributes.length!=3 ||
			!(intention.attributes[0] instanceof ConstantTermAttribute) ||
			!(intention.attributes[1] instanceof ConstantTermAttribute) ||
			!(intention.attributes[2] instanceof ConstantTermAttribute)) {
			if (requester != null) {
				let tmp:string = "action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))";
				let term:Term = Term.fromString(tmp, ai.o);
				ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
			}
			return true;
		}
		let itemID:string = (<ConstantTermAttribute>(intention.attributes[1])).value;
		let containerID:string = (<ConstantTermAttribute>(intention.attributes[2])).value;
		let item:A4Object = null;
		for(let o of ai.robot.inventory) {
			if (o.ID == itemID) {
				item = o;
				break;
			}
		}
		if (item == null) {
			if (requester != null) {
				let term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
				let cause:Term = Term.fromString("#not(verb.have('"+ai.selfID+"'[#id], '"+itemID+"'[#id]))", ai.o);
				ai.intentions.push(new IntentionRecord(term, null, null, new CauseRecord(cause, null, ai.time_in_seconds), ai.time_in_seconds));
			}
			return true;
		}

		let containerObjectL:A4Object[] = ai.game.findObjectByID(containerID);
		if (containerObjectL == null) {
			// check if it's a location:
			let targetLocation:AILocation = ai.game.getAILocationByID(containerID);
			if (targetLocation != null) {
				let term2:Term = intention.clone([]);
				term2.functor = ai.o.getSort("action.drop");
				ai.intentions.push(new IntentionRecord(term2, null, null, null, ai.time_in_seconds));
				return true;
			}

			if (requester != null) {
				let term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
				let cause:Term = Term.fromString("#not(verb.see('"+ai.selfID+"'[#id], '"+containerID+"'[#id]))", ai.o);
				ai.intentions.push(new IntentionRecord(term, null, null, new CauseRecord(cause, null, ai.time_in_seconds), ai.time_in_seconds));
			}
			return true;
		}
		if (containerObjectL.length != 1) {
			if (requester != null) {
				let term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
				ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
			}
			return true;
		}


		let destinationMap:A4Map = containerObjectL[0].map;

		// Check if the robot can go:
		let destinationLocation:AILocation = ai.game.getAILocation(containerObjectL[0]);
		let destinationLocationID:string = null;
		if (destinationLocation != null) destinationLocationID = destinationLocation.id;
		let cannotGoCause:Term = ai.canGoTo(destinationMap, destinationLocationID, requester);
		if (cannotGoCause != null) {
			if (requester != null) {
				// deny request:
				let term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
				let causeRecord:CauseRecord = new CauseRecord(cannotGoCause, null, ai.time_in_seconds)
				ai.intentions.push(new IntentionRecord(term, null, null, causeRecord, ai.time_in_seconds));

				// explain cause:
				term = new Term(ai.o.getSort("action.talk"), 
								[new ConstantTermAttribute(ai.selfID, ai.o.getSort("#id")),
								 new TermTermAttribute(new Term(ai.o.getSort("perf.inform"),
								 		  			   [requester, new TermTermAttribute(cannotGoCause)]))]);
				ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
			}
			return true;
		}

		if (destinationMap == null) {
			if (requester != null) {
				let term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
				let cause:Term = Term.fromString("#not(verb.know('"+ai.selfID+"'[#id], #and(the(P:'path'[path], N:[singular]), noun(P, N))))", ai.o);
				ai.intentions.push(new IntentionRecord(term, null, null, new CauseRecord(cause, null, ai.time_in_seconds), ai.time_in_seconds));
			}
			return true;
		}
		if (containerObjectL[0] instanceof A4ObstacleContainer) {
			if ((<A4ObstacleContainer>containerObjectL[0]).closeable && (<A4ObstacleContainer>containerObjectL[0]).closed &&
				(<A4ObstacleContainer>containerObjectL[0]).doorID != null) {
				if (requester != null) {
					let term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
					let cause:Term = Term.fromString("property.closed('"+containerObjectL[0].ID+"'[#id])", ai.o);
					ai.intentions.push(new IntentionRecord(term, null, null, new CauseRecord(cause, null, ai.time_in_seconds), ai.time_in_seconds));
				}
				return true;
			}
		} else {
			let term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
			ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
			return true;
		}

		app.achievement_nlp_all_robot_actions[4] = true;
		app.trigger_achievement_complete_alert();

		// go to destination:
        let q:A4ScriptExecutionQueue = new A4ScriptExecutionQueue(ai.robot, ai.robot.map, ai.game, null);
        let s:A4Script = null
    	s = new A4Script(A4_SCRIPT_PUT_IN_CONTAINER, containerObjectL[0].ID, null, 0, false, false);
        s.ID2 = itemID;	// the object we want to put in
        q.scripts.push(s);
        ai.setNewAction(intention, requester, q, null);
		ai.addLongTermTerm(new Term(intention.functor,
									[new ConstantTermAttribute(ai.selfID,ai.cache_sort_id),
									 new TermTermAttribute(intention)]), PERCEPTION_PROVENANCE);
		ai.intentionsCausedByRequest.push(ir);
		if (requester != null) {
			let tmp:string = "action.talk('"+ai.selfID+"'[#id], perf.ack.ok("+requester+"))";
			let term:Term = Term.fromString(tmp, ai.o);
			ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
		}

		return true;
	}


	saveToXML(ai:RuleBasedAI) : string
	{
		return "<IntentionAction type=\"RobotPutIn_IntentionAction\"/>";
	}


	static loadFromXML(xml:Element, ai:RuleBasedAI) : IntentionAction
	{
		return new RobotPutIn_IntentionAction();
	}
}
