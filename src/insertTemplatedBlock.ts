import '@logseq/libs'
import {
  IBatchBlock,
} from '@logseq/libs/dist/LSPlugin.user';

import {parseDynamically} from './parser';
var data = null

var blockUuid2

async function triggerParse(obj){
  let reg = /<%([^%].*?)%>/g
  if (obj.content) {
    let regexMatched = obj.content.match(reg)
      for (const x in regexMatched){
        let toBeParsed = obj.content
        var currentMatch = regexMatched[x]
        let formattedMatch = await parseDynamically(currentMatch);
      //   await parseDynamically(currentMatch).then(function(result){if (result == "Error"){
      //     console.log("HI")
      //     delete(obj.children)
      // }
      // else{
      //   console.log("BYE")
        let newRegexString = toBeParsed.replace(currentMatch, formattedMatch)
        obj.content = newRegexString
      // }
    }
    // )
        

      //   if (formattedMatch != "Error"){
      //     console.log("BYE")
      //   let newRegexString = toBeParsed.replace(currentMatch, formattedMatch)
      //   obj.content = newRegexString
      // }
      // else{
      //   console.log("HI")
      //   obj.content = null, 
      //   obj.children = null,
      //   obj.uuid = null
      //   obj.id = null
      // }
     }
    
  await obj.children.map(triggerParse)
}

export async function insertProperlyTemplatedBlock (blockUuid, template, sibling) {
    var query = `
    [:find (pull ?b [*])
   :where
   [?b :block/properties ?p]
   [(get ?p :template) ?ty]
   [(= "${template}" ?ty)]]`
blockUuid2 = blockUuid
    let refUUID
    try {
      let ret = await logseq.DB.datascriptQuery(query)
      const results = ret?.flat()
      if(results && results.length > 0) {
        refUUID = results[0].uuid.$uuid$
        const origBlock = await logseq.Editor.getBlock(refUUID, {
          includeChildren: true,
        });
        data = origBlock
        function insertFinally (){
          logseq.Editor.insertBatchBlock(blockUuid, data.children as unknown as IBatchBlock, sibling)
        }

          triggerParse(data)
          setTimeout(function(){
            insertFinally()
          }, 100);
        if (origBlock.children.length === 0 || !origBlock.children) {
              logseq.App.showMsg("Whoops! Doesn't look like there's any content under the template.");
            
            }
    }
  } 
  catch (err) {
      console.log(err)
    }

  }