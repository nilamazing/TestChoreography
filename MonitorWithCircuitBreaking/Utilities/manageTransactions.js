let transactTrackerObj={};

function updateTrasaction(transactId,transactProp){
  if(transactTrackerObj){
    
    if(transactProp.status==="Created"){
        transactTrackerObj[transactId]=transactProp;
        registerTimeoutWithTrasaction(transactId);
    }
    else if(transactProp.status==="Completed"){
        clearTimeoutWithTransaction(transactId);
        deleteTransactionInstance(transactId);
    }
    else{
        if(getTransactionInstance(transactId)){
            transactTrackerObj[transactId]=transactProp;
             // Ignore if transactid does not exist as this means "Pending has arrived after Completed Status"
        }
        
    }
    //   if(!transactTrackerObj[transactId]){
    //       transactTrackerObj[transactId]=transactProp;
    //   }
    //   else{

    //   }
  }
}

function getAllTransactions(){
    return transactTrackerObj;
}
function getTransactionInstance(transactId){
    return transactTrackerObj[transactId]?transactTrackerObj[transactId]:null;
}

function deleteTransactionInstance(transactId){
    if(getTransactionInstance(transactId)){
        transactTrackerObj[transactId]=null;
    }
}

function registerTimeoutWithTrasaction(transactId){
    const timeoutIdObj=setTimeout(()=>{ 
        if(getTransactionInstance(transactId)){
            if(transactTrackerObj[transactId]["status"]!=="Completed"){
                console.log("Should Trigger Compensating flow for transaction id :- ",transactId);
                transactTrackerObj[transactId]["rollback"]=true;
                // In this case we will drop an event in the Rollback Topic
                // dropEventInRollbackTopic(transactId);
            }
        }
    },30000);
    transactTrackerObj[transactId]["checkStatus"]=timeoutIdObj;
}

function clearTimeoutWithTransaction(transactId){
    if(getTransactionInstance(transactId) && transactTrackerObj[transactId]["checkStatus"]){
        console.log("Clearing out Transaction timeout method for transaction id :- ",transactId);
        clearTimeout(transactTrackerObj[transactId]["checkStatus"]);
        transactTrackerObj[transactId]["checkStatus"]=null;
    }
}

module.exports={updateTrasaction,getTransactionInstance,deleteTransactionInstance,getAllTransactions}