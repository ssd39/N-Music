console.log("Welcome!")

const config = {
  networkId: "testnet",
  keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};


let handle_buy = async (tokenid,contract_id,price)=>{

  const wallet = new nearApi.WalletConnection(window.near);

  if(!wallet.isSignedIn()){
    SnackBar({
      message: "Please Connect Your Wallet First!",
      icon: "ℹ️",
      status: "info"
    })
    setTimeout(()=>{
      window.location.replace('/profile/')
    },900)
    return;
  }


  await fetch('https://nftmarketplacenear.herokuapp.com/nftbought',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({  
      "contract_token_id": `${contract_id}.${tokenid}`,
      "ownerid": wallet.getAccountId()
    })
  })

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
  contract.offer(
    { nft_contract_id: contract_id ,token_id: tokenid},
    BOATLOAD_OF_GAS,
    Big(price || '0').times(10 ** 24).toFixed()
  )
}


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


async function list_items(){
  $("#menu_loader_gif").show()
  let response = [];
  let req = await fetch('https://nftmarketplacenear.herokuapp.com/nft')
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
      obj['ownerid'] = v['ownerid']

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

  let s='';

  for(let i of response){
    let a= '<div  class="menu_item">'
    a+= `<img onclick="window.open('${window.location.origin}/themes/${i['theme']}/?music=${btoa(i['music'])}');" src="${i['gif']}">`
    a+= '<div style="display: flex; flex-direction: column; margin-top: 15px;">'
    a+= `<span style="color: #0ff; font-family:cursive; font-weight: bold; font-size: medium;">${i['name']}</span>`
    a+= `<span style="color: white; font-family:cursive">${i['short_description']}</span>`
    a+= `<span style="color: white;font-family:cursive">${i['price']} NEAR</span>`
    a+= '</div>'
    a+=  `<button class="login" style="margin-top: 10px;" onclick="handle_buy('${i['token_id']}','${i['id']}','${i['price']}')">Buy</button>`
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


$(document).ready(()=>{
  if(window.near){
    const wallet = new nearApi.WalletConnection(window.near);
    list_items();
  }
});

