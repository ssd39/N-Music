console.log("Welcome!")

const config = {
  networkId: "testnet",
  keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};


let gif_cid = null;
let current_music= null;
let current_theme=null;
let current_tokenid=null;
let current_contractid=null;

function dropHandler(ev) {
    console.log('File(s) dropped');
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
          var file = ev.dataTransfer.items[i].getAsFile();
          let ext = (file.name).split(".").pop() 
          if(ext=="mp3"){
            $("#drop_music_span").text(file.name)
            console.log('... file[' + i + '].name = ' + file.name);

            const reader = new FileReader();
            reader.addEventListener("load", function () {
              let x = document.createElement("IFRAME");
              x.style.height ="80%";
              x.style.width ="80%";
              x.id="rcd_frame"
              let themes = ["t1","t2","t3"]
              let theme = themes[Math.floor(Math.random() * themes.length)];
              x.src = `${window.location.origin}/themes/${theme}/?music=record&record=true`;
              $("#record_frame").append(x) 
              $("#record_frame").css("display", "flex");
              x.onload= ()=> {
                  console.log('Iframe Loaded!')
                  x.contentWindow.postMessage({call:'sendFile', value:reader.result });
                  current_music = reader.result;
                  current_theme = theme;
               };
              
            }, false);
            reader.readAsDataURL(file);
            
          }
          
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        let ext = (ev.dataTransfer.files[i].name).split(".").pop()
        if(ext=="mp3"){ 
            $("#drop_music_span").text(ev.dataTransfer.files[i].name)
            console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
        }
      }
    }
}

function dragOverHandler(ev) {
    console.log('File(s) in drop zone');
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}

$("#submit_sell").click(async ()=>{
  $("#nft_amount").attr('disabled','disabled')
  $("#submit_sell").hide()
  $("#sell_loader_gif").show()
  let price = parseInt($("#nft_amount").val())
  if(price<=0){
    SnackBar({
      message: "Sell price should be greater then zero!",
      icon: "exclamation",
      status: "danger"
    })
  }

  const wallet = new nearApi.WalletConnection(window.near);

  await fetch('https://nftmarketplacenear.herokuapp.com/nftsale',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "contract_token_id": `${current_contractid}.${current_tokenid}`, 
      "price": $("#nft_amount").val()
    })
  })
  
  price = nearApi.utils.format.parseNearAmount($("#nft_amount").val())

  const walletAccountObj = wallet.account();
  const contract = new nearApi.Contract(
    walletAccountObj, // the account object that is connecting
    current_contractid,
    {
      // name of contract you're connecting to
      viewMethods: ["nft_tokens"], // view methods do not change state but usually return a value
      changeMethods: ["nft_approve","nft_mint"], // change methods modify state
      sender: walletAccountObj, // account object to initialize and sign transactions.
    }
  );
  let args = {
    token_id: current_tokenid,
    account_id: 'market.nftmarketplace.testnet',
    msg: JSON.stringify({ sale_conditions: price })
  }
  
  let GAS = "300000000000000";
  let deposit = nearApi.utils.format.parseNearAmount('0.1');
  
  await contract.nft_approve(args, GAS, deposit);
  
})

let handle_set_for_sell = async (token_id,contract_id)=>{
  const wallet = new nearApi.WalletConnection(window.near);
  const walletAccountObj = wallet.account();
  const contract = new nearApi.Contract(
    walletAccountObj, // the account object that is connecting
    "market.nftmarketplace.testnet",
    {
      // name of contract you're connecting to
      viewMethods: ["storage_balance_of","get_sales_by_owner_id","get_supply_by_owner_id"], // view methods do not change state but usually return a value
      changeMethods: ["storage_deposit","offer"], // change methods modify state
      sender: walletAccountObj // account object to initialize and sign transactions.
    }
  );
  const response = await contract.storage_balance_of({account_id:wallet.getAccountId()});
  const response1 = await contract.get_supply_by_owner_id({account_id:wallet.getAccountId()});
  let final = response/100000000000000000000000 - response1;
  if(final<1){
    SnackBar({
      message: "Insufficient storage balance. Please add balance!",
      icon: "exclamation",
      status: "danger"
    })
    $("#ppopup1").css("display","flex")
    return;
  }
  current_tokenid=token_id;
  current_contractid=contract_id;
  $("#ppopup").css("display","flex");
}

$("#add_balance").click(()=>{
  $("#balance_loader_gif").show()
  $("#add_balance").hide()
  let amc = $("#balance_amount").val()
  if(amc<0.1){
    SnackBar({
      message: "Amount must be greater then or equal to 0.1 NEAR!",
      icon: "exclamation",
      status: "danger"
    })
    $("#balance_loader_gif").hide()
    $("#add_balance").show()
    return;
  }
  const wallet = new nearApi.WalletConnection(window.near);
  const walletAccountObj = wallet.account();
  const BOATLOAD_OF_GAS = Big(30).times(10 ** 13).toFixed();
  const contract = new nearApi.Contract(
    walletAccountObj, // the account object that is connecting
    "market.nftmarketplace.testnet",
    {
      // name of contract you're connecting to
      viewMethods: ["storage_balance_of","get_sales_by_owner_id","get_supply_by_owner_id"], // view methods do not change state but usually return a value
      changeMethods: ["storage_deposit","offer"], // change methods modify state
      sender: walletAccountObj // account object to initialize and sign transactions.
    }
  );
  contract.storage_deposit(
    {account_id:wallet.getAccountId()},
    BOATLOAD_OF_GAS,
    Big(amc || '0').times(10 ** 24).toFixed()
    )
    $("#balance_loader_gif").hide()
    $("#add_balance").show()
})

let handle_unset_for_sell = async (tokenid)=>{
  const wallet = new nearApi.WalletConnection(window.near);
  const walletAccountObj = wallet.account();
  const BOATLOAD_OF_GAS = Big(30).times(10 ** 13).toFixed();
  const contract = new nearApi.Contract(
    walletAccountObj, // the account object that is connecting
    "market.nftmarketplace.testnet",
    {
      // name of contract you're connecting to
      viewMethods: ["storage_balance_of","get_sales_by_owner_id","get_supply_by_owner_id"], // view methods do not change state but usually return a value
      changeMethods: ["storage_deposit","offer","remove_sale"], // change methods modify state
      sender: walletAccountObj // account object to initialize and sign transactions.
    }
  );
  contract.remove_sale(
    { nft_contract_id: `${wallet.getAccountId().split(".")[0]}.factory.nftmarketplace.testnet` ,token_id:tokenid},
    BOATLOAD_OF_GAS,
    Big(1 || '0').times(1).toFixed()
  )
}

let lock_mint_ui = ()=>{
  $("#music_name").attr('disabled','disabled')
  $("#short_description").attr('disabled','disabled')
  $("#submit_music").hide()
  $("#loader_gif").show()
}
let unlock_mint_ui = ()=>{
  $("#music_name").removeAttr('disabled','disabled')
  $("#short_description").removeAttr('disabled','disabled')
  $("#loader_gif").hide()
  $("#submit_music").show()
}

let is_contract_deployed = async ()=>{
  let wallet = new nearApi.WalletConnection(window.near);

  const walletAccountObj = wallet.account();
  const contract = new nearApi.Contract(
    walletAccountObj, // the account object that is connecting
    "factory.nftmarketplace.testnet",
    {
      // name of contract you're connecting to
      viewMethods: ["get_account_exist"], // view methods do not change state but usually return a value
      changeMethods: ["create_nft"], // change methods modify state
      sender: walletAccountObj, // account object to initialize and sign transactions.
    }
  );
  const response = await contract.get_account_exist({ nft_id: `${wallet.getAccountId().split(".")[0]}.factory.nftmarketplace.testnet` });
  return response;
}

$("#submit_music").click(async ()=>{

  lock_mint_ui()

  /*---------------------------*/
  let wallet =null;
  if(window.near){
    wallet = new nearApi.WalletConnection(window.near);
    if(!wallet.isSignedIn()){
      SnackBar({
        message: "Connecting NEAR wallet.",
        icon: "ℹ️",
        status: "info"
      })
      setTimeout(()=>{
        signIn()
      },800)
      return;
    }else{
      const walletAccountObj = wallet.account();
      const contract = new nearApi.Contract(
        walletAccountObj, // the account object that is connecting
        "factory.nftmarketplace.testnet",
        {
          // name of contract you're connecting to
          viewMethods: ["get_account_exist"], // view methods do not change state but usually return a value
          changeMethods: ["create_nft"], // change methods modify state
          sender: walletAccountObj, // account object to initialize and sign transactions.
        }
      );
      const response = await contract.get_account_exist({ nft_id: `${wallet.getAccountId().split(".")[0]}.factory.nftmarketplace.testnet` });
      if(!response){
        SnackBar({
          message: "Please Deploy Contract First!",
          icon: "ℹ️",
          status: "info"
        })
        /*setTimeout(()=>{
          const BOATLOAD_OF_GAS = Big(30).times(10 ** 13).toFixed();
          contract.create_nft(
            { nft_id: wallet.getAccountId().split(".")[0],owner_id: wallet.getAccountId() },
            BOATLOAD_OF_GAS,
            Big(5 || '0').times(10 ** 24).toFixed()
          )
        },800)*/
        return;
      }
    }
  }else{
    SnackBar({
      message: "Sorry, Dapp not able initialize NEAR sdk contact developers!",
      icon: "exclamation",
      status: "danger"
    })
    unlock_mint_ui()
    return;
  }
  /*-----------------------------*/


  if(!current_music){
    SnackBar({
      message: "Please Drop Your Music First!",
      icon: "exclamation",
      status: "danger"
    })
    unlock_mint_ui()
    return;
  }
  if(!gif_cid){
    SnackBar({
      message: "Please Wait For ART Generation!",
      icon: "exclamation",
      status: "danger"
    })
    unlock_mint_ui()
    return;
  }
  let name = $("#music_name").val()
  let short_description = $("#short_description").val()

  if(!name){
    SnackBar({
      message: "Please Fill The Name Field!",
      icon: "exclamation",
      status: "danger"
    })
    unlock_mint_ui()
    return;
  }

  if(!short_description){
    SnackBar({
      message: "Please Fill The Short Description Field!",
      icon: "exclamation",
      status: "danger"
    })
    unlock_mint_ui()
    return;
  }


  SnackBar({
    message: "Uploading Music To IPFS.",
    icon: "ℹ️",
    status: "info"
  })

  let music_cid = await window.uploadW3s([new File([dataURItoBlob(current_music)], makeid(6))]);
  console.log(`Music cid: ${music_cid}`)

  SnackBar({
    message: "Music Sucessfully Uploaded To IPFS.",
    icon: "✅",
    status: "success"
  })

  SnackBar({
    message: "Uploading MetaData To IPFS.",
    icon: "ℹ️",
    status: "info"
  })

  const metadata_file = new File([new Blob([`{"music": "https://${music_cid}.ipfs.infura-ipfs.io/","theme":"${current_theme}", "gif": "https://${gif_cid}.ipfs.infura-ipfs.io/", "name":"${name}", "short_description":"${short_description}"}`], {
    type: 'text/plain'
  })], 'metadata.json', {
    type: "application/json"
  });

  let metadata_cid = await window.uploadW3s([metadata_file]);
  console.log(`Metadata cid: ${metadata_cid}`)

  SnackBar({
    message: "MetaData Sucessfully Uploaded To IPFS.",
    icon: "✅",
    status: "success"
  })
  SnackBar({
    message: "Making Transaction To Mint NFT.",
    icon: "ℹ️",
    status: "info"
  })

  let token_id= makeid(6)

  let rx = await fetch('https://nftmarketplacenear.herokuapp.com/nft',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "contractid": `${wallet.getAccountId().split(".")[0]}.factory.nftmarketplace.testnet`,
      "tokenid": token_id,
      "metadata": `https://${metadata_cid}.ipfs.infura-ipfs.io/`,
      "ownerid": wallet.getAccountId()
    })
  })
  if(!(await rx.json())['success']){
    SnackBar({
      message: "Sorry, Technical Error Try Again!",
      icon: "exclamation",
      status: "danger"
    })
    unlock_mint_ui()
    return;
  }
 
  /*---------------------------*/

  const BOATLOAD_OF_GAS = Big(30).times(10 ** 13).toFixed();
  const walletAccountObj = wallet.account();
  const contract = new nearApi.Contract(
    walletAccountObj, // the account object that is connecting
    `${wallet.getAccountId().split(".")[0]}.factory.nftmarketplace.testnet`,
    {
      // name of contract you're connecting to
      viewMethods: ["nft_tokens"], // view methods do not change state but usually return a value
      changeMethods: ["nft_approve","nft_mint"], // change methods modify state
      sender: walletAccountObj, // account object to initialize and sign transactions.
    }
  );
  contract.nft_mint(
    { token_id:  token_id, metadata: { title: name, description: short_description, media: `https://${metadata_cid}.ipfs.infura-ipfs.io/` }, receiver_id:  wallet.getAccountId()},
    BOATLOAD_OF_GAS,
    Big(0.1 || '0').times(10 ** 24).toFixed()
  )

  /*---------------------------*/

  current_music=null;
  current_theme=null;
  gif_cid=null;

  SnackBar({
    message: "Congratulations Minting Completed!",
    icon: "✅",
    status: "success"
  })

  $("#drop_music_span").text("Drop Music Here")
  $("#music_name").val('')
  $("#short_description").val('')
  $("#gif_holder").hide()

  unlock_mint_ui()
})

 function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}


 function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}


 window.addEventListener("message", async (event)=>{
  const message = event.data.message;
  switch (message) {
    case 'gifResult':
      
      $("#record_frame").empty()
      $("#record_frame").hide()

      $("#submit_music").hide()
      $("#loader_gif").show()

      let url = event.data.value;

      $("#gif_holder_img").attr("src",url);
      $("#gif_holder").css("display","flex");
      
      SnackBar({
        message: "ART Generated.",
        icon: "✅",
        status: "success"
      })
      SnackBar({
        message: "Uploading ART To IPFS.",
        icon: "ℹ️",
        status: "info"
      })
      gif_cid = await window.uploadW3s([new File([dataURItoBlob(url)], makeid(6))]);
      console.log(`Gif cid: ${gif_cid}`)
      SnackBar({
        message: "ART Sucessfully Uploaded To IPFS.",
        icon: "✅",
        status: "success"
      })
      $("#submit_music").show()
      $("#loader_gif").hide()
      break;
  }
 }, false);



async function list_items(){

  $("#menu_loader_gif").show()

  let wallet = new nearApi.WalletConnection(window.near);
  
  let response = [];
  let req = await fetch('https://nftmarketplacenear.herokuapp.com/nftid',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({  
      "ownerid": wallet.getAccountId()
    })
  })
  let res = await req.json()
  /*  let response = [
    {'token_id':'0','id':'poly.factory.nftmarketplace.testnet','name':'test','short_description':'test','price':'1','music':'http://127.0.0.1:5500/temp/Caller_Tune_Humshakals_Saif_Ali_(getmp3.pro).mp3','gif':'','theme':'t1' },
    {'token_id':'0','id':'poly.factory.nftmarketplace.testnet','name':'test','short_description':'test','price':'1','music':'http://127.0.0.1:5500/temp/Caller_Tune_Humshakals_Saif_Ali_(getmp3.pro).mp3','gif':'','theme':'t2'}
  ];*/
  console.log(res)
  for(let v of res){
    try{
      let obj ={};
      obj['token_id']=v['tokenid'];
      obj['id']=v['contractid'];
      obj['price']=v['price']
      obj['on_sell']=v['isonsale']

      console.log(v['metadata'])
      let req1 = await fetch(v['metadata'])
      let res1 = await req1.json()
      
      obj['music']=res1['music']
      obj['theme'] = res1['theme']
      obj['gif'] = res1['gif']
      obj['short_description'] = res1['short_description']
      obj['name'] = res1['name']

      response.push(obj)
    }catch(e){
      console.error(e)
    }
  }


  console.log(response)
  let s='';

  for(let i of response){
    let a= '<div class="menu_item">'
    a+= `<img onclick="window.open('${window.location.origin}/themes/${i['theme']}/?music=${btoa(i['music'])}');" src="${i['gif']}">`
    a+= '<div style="display: flex; flex-direction: column; margin-top: 15px;">'
    a+= `<span style="color: #0ff; font-family:cursive; font-weight: bold; font-size: medium;">${i['name']}</span>`
    a+= `<span style="color: white; font-family:cursive">${i['short_description']}</span>`
    a+= i['on_sell']?`<span style="color: white;font-family:cursive">${i['price']} NEAR</span>`:`<span style="color: white;font-family:cursive">Not On Sell</span>`
    a+= '</div>'
    a+=  i['on_sell']?`<button class="login" style="margin-top: 10px;" onclick="handle_unset_for_sell('${i['token_id']}')">Unlist</button>`:`<button class="login" style="margin-top: 10px;" onclick="handle_set_for_sell('${i['token_id']}','${i['id']}')">Sell</button>`
    a+= '</div>'
    s+= a;
  }
  $("#items_menu").append(s)
  $("#menu_loader_gif").hide()
}


if(!window.near){
  (async  () =>{
    window.near = await nearApi.connect(config);
    
  })()
}

const signIn = () => {
  // create wallet connection
  const wallet = new nearApi.WalletConnection(window.near);
  wallet.requestSignIn(
    "example-contract.testnet", // contract requesting access
    "Example App", // optional
  );
};

$("#acc_connect").click(()=>{
  signIn();
})

let handle_deploy_ui = async ()=>{
  let cc_status = await is_contract_deployed()
  if(cc_status){
    $("#verified_symbl").show()
    $("#deply_contract").hide()
  }else{
    $("#deply_contract").show()
  }
}

$("#deply_contract").click(()=>{
  const wallet = new nearApi.WalletConnection(window.near);
  const walletAccountObj = wallet.account();
  const contract = new nearApi.Contract(
    walletAccountObj, // the account object that is connecting
    "factory.nftmarketplace.testnet",
    {
      // name of contract you're connecting to
      viewMethods: ["get_account_exist"], // view methods do not change state but usually return a value
      changeMethods: ["create_nft"], // change methods modify state
      sender: walletAccountObj, // account object to initialize and sign transactions.
    }
  );
  const BOATLOAD_OF_GAS = Big(30).times(10 ** 13).toFixed();
  contract.create_nft(
    { nft_id: wallet.getAccountId().split(".")[0],owner_id: wallet.getAccountId() },
    BOATLOAD_OF_GAS,
    Big(5 || '0').times(10 ** 24).toFixed()
  )

})

$(document).ready(()=>{
  if(window.near){
    const wallet = new nearApi.WalletConnection(window.near);
    if(wallet.isSignedIn()){
      $("#acc_connect").hide()
      $("#hi_acc").show()
      $("#hi_acc").text(`Hi, ${wallet.getAccountId()}`)
      $("#menu_").css("display", "flex");
      list_items();
      handle_deploy_ui();
    }else{
      $("#hi_acc").hide()
      $("#acc_connect").show()
    }
  }
});