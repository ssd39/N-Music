import {near,JSONValue,json,ipfs,log} from  "@graphprotocol/graph-ts"
import {NFT} from "../generated/schema"

export function handleReceipt(
  receipt: near.ReceiptWithOutcome
): void{
  log.info('hey there I am called',[]);
const actions = receipt.receipt.actions;
for( let i =0;i<actions.length;i++){
handleAction(actions[i],receipt)}
}

function handleAction(
action:near.ActionValue,
receiptWithOutcome: near.ReceiptWithOutcome): void{
  log.info('hey there I am called',[]);
if(action.kind != near.ActionKind.FUNCTION_CALL){
  return;

}
const outcome = receiptWithOutcome.outcome;
const functioncall = action.toFunctionCall();
const methodname = functioncall.methodName;
log.warning('hey there {}',[methodname]);
if(methodname == 'nft_on_mint'){
 for(let logIndex=0;logIndex< outcome.logs.length;logIndex++){
 const outcomeLog = outcome.logs[logIndex].toString();
 const parsed = outcomeLog.replace('EVENT_JSON:', '')

 const jsonData = json.try_fromString(parsed)
 const jsonObject = jsonData.value.toObject()

 const eventData = jsonObject.get('data')
 if (eventData) {
   const eventArray:JSONValue[] = eventData.toArray()

   const data = eventArray[0].toObject()
   const tokenIds = data.get('token_ids')
   const owner_id = data.get('owner_id')
   if (!tokenIds || !owner_id) return

   const ids:JSONValue[] = tokenIds.toArray()
   const tokenId = ids[0].toString()

   let token = NFT.load(tokenId)
  
 }
 }}
 else if(methodname == 'offer'){
  for(let logIndex=0;logIndex< outcome.logs.length;logIndex++){
  const outcomeLog = outcome.logs[logIndex].toString();
   
  }
  }
  else if(methodname == 'on_approve_nft'){
    for(let logIndex=0;logIndex< outcome.logs.length;logIndex++){
    const outcomeLog = outcome.logs[logIndex].toString();
     
    }
    }
}