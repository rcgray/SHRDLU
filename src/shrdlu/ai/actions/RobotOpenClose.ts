class RobotOpenClose_IntentionAction extends IntentionAction {

	canHandle(intention:Term, ai:RuleBasedAI) : boolean
	{
		if (intention.functor.is_a(ai.o.getSort("action.open")) ||
			intention.functor.is_a(ai.o.getSort("action.close"))) return true;
		return false;
	}


	execute(ir:IntentionRecord, ai_raw:RuleBasedAI) : boolean
	{
		let ai:RobotAI = <RobotAI>ai_raw;
		let intention:Term = ir.action;
		let requester:TermAttribute = ir.requester;
		let targetID:string = (<ConstantTermAttribute>(intention.attributes[1])).value;
		let door:A4Object = null;
		let open:boolean = true;

		if (ai.robot.isInVehicle()) {
			if (requester != null) {
				let term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
				ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
			}
			return true;
		}

		if (intention.functor.is_a(ai.o.getSort("action.close"))) open = false;

		// check if it's a door:
		let door_tmp:A4Object = ai.game.findObjectByIDJustObject(targetID);
		if (door_tmp != null) {
			door = door_tmp;
		} else if (door_tmp == null) {
        	// see if it's a location with a door (e.g., a bedroom):
        	// We don't launch a whole inference here, as these facts are directly on the knowledge base:
			let doors:A4Object[] = [];
        	let belong_l:Sentence[] = ai.longTermMemory.allSingleTermMatches(ai.o.getSort("verb.belong"), 2, ai.o);
        	for(let belong of belong_l) {
    			let t:Term = belong.terms[0];
    			if ((t.attributes[0] instanceof ConstantTermAttribute) &&
    				(t.attributes[1] instanceof ConstantTermAttribute)) {
    				if ((<ConstantTermAttribute>t.attributes[1]).value == targetID) {
    					let door:A4Object = ai.game.findObjectByIDJustObject((<ConstantTermAttribute>t.attributes[0]).value);
    					if (door != null && (door instanceof A4Door)) {
    						doors.push(door);
    					}
    				}
    			}
        	}

    		// we have found at least a door!
    		for(let door_tmp of doors) {
	            if ((<A4Door>door_tmp).closed == open) {
					// see if player has permission:
	            	if (ai.doorsPlayerIsNotPermittedToOpen.indexOf((<A4Door>door_tmp).doorID) == -1) {
	            		door = door_tmp;
					}
	            }
	        }
	        // if we cannot find any with permission, at least find one:
	        if (door == null && doors.length > 0) {
	        	door = doors[0];
	        }
		}

		if (door != null && (door instanceof A4Door)) {
            if ((<A4Door>door).closed == open) {
            	if ((<A4Door>door).checkForBlockages(true, null, ai.robot.map, ai.game, [])) {
					// see if player has permission:
	            	if (ai.doorsPlayerIsNotPermittedToOpen.indexOf((<A4Door>door).doorID) == -1) {

						app.achievement_nlp_all_robot_actions[(open ? 7:8)] = true;
						app.trigger_achievement_complete_alert();

	            		// do it!
				        var q:A4ScriptExecutionQueue = new A4ScriptExecutionQueue(ai.robot, ai.robot.map, ai.game, null);
				        var s:A4Script = new A4Script(A4_SCRIPT_INTERACT_WITH_OBJECT, door.ID, null, 0, false, false);
				        q.scripts.push(s);
				        ai.setNewAction(intention, ir.requester, q, null);
						ai.addLongTermTerm(new Term(intention.functor,
													  [new ConstantTermAttribute(ai.selfID,ai.cache_sort_id),
													   new TermTermAttribute(intention)]), PERCEPTION_PROVENANCE);
						ai.intentionsCausedByRequest.push(ir);
						var term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.ok("+ir.requester+"))", ai.o);
						ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
						return true;
					} else {
						// no permission
						var term2:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.inform("+ir.requester+", #not(verb.have("+ir.requester+",[permission-to]))))", ai.o);
						ai.intentions.push(new IntentionRecord(term2, null, null, null, ai.time_in_seconds));
						return true;
					}
				} else {
					let term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+requester+"))", ai.o);
					ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
				}
            } else {
            	// it's already open
				if (ir.requester != null) {
					if ((<A4Door>door).closed) {
						var term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.inform("+ir.requester+",property.closed('"+targetID+"'[#id])))", ai.o);
					ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
					} else {
						var term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.inform("+ir.requester+",property.opened('"+targetID+"'[#id])))", ai.o);
					ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
					}
				}
				return true;
            }
        } else if (door != null && (door instanceof A4ObstacleContainer) &&
        	 	   (<A4ObstacleContainer>door).closeable) {
            if ((<A4ObstacleContainer>door).closed == open) {
				app.achievement_nlp_all_robot_actions[(open ? 7:8)] = true;
				app.trigger_achievement_complete_alert();

        		// do it!
		        var q:A4ScriptExecutionQueue = new A4ScriptExecutionQueue(ai.robot, ai.robot.map, ai.game, null);
		        var s:A4Script = new A4Script(A4_SCRIPT_INTERACT_WITH_OBJECT, door.ID, null, 0, false, false);
		        q.scripts.push(s);
		        ai.setNewAction(intention, ir.requester, q, null);
				ai.addLongTermTerm(new Term(intention.functor,
											  [new ConstantTermAttribute(ai.selfID,ai.cache_sort_id),
											   new TermTermAttribute(intention)]), PERCEPTION_PROVENANCE);
				ai.intentionsCausedByRequest.push(ir);
				var term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.ok("+ir.requester+"))", ai.o);
				ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
				return true;
            } else {
            	// it's already open
				if (ir.requester != null) {
					if ((<A4ObstacleContainer>door).closed) {
						var term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.inform("+ir.requester+",property.closed('"+targetID+"'[#id])))", ai.o);
					ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
					} else {
						var term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.inform("+ir.requester+",property.opened('"+targetID+"'[#id])))", ai.o);
					ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
					}
				}
				return true;
            }

		} else {
			if (ir.requester != null) {
				var term:Term = Term.fromString("action.talk('"+ai.selfID+"'[#id], perf.ack.denyrequest("+ir.requester+"))", ai.o);
				//var cause:Term = Term.fromString("#not(door('"+targetID+"'[#id]))", ai.o);
				//ai.intentions.push(new IntentionRecord(term, null, null, new CauseRecord(cause, null, ai.time_in_seconds), ai.time_in_seconds));
				ai.intentions.push(new IntentionRecord(term, null, null, null, ai.time_in_seconds));
			}
			return true;
		}

		return true;
	}


	saveToXML(ai:RuleBasedAI) : string
	{
		return "<IntentionAction type=\"RobotOpenClose_IntentionAction\"/>";
	}


	static loadFromXML(xml:Element, ai:RuleBasedAI) : IntentionAction
	{
		return new RobotOpenClose_IntentionAction();
	}
}
