const {BlockChain, Transaction} = require('./blockChain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const mykey = ec.keyFromPrivate('4aa2247bde87fdcf2bda1186e37354609a47ff22ec0c6d95f2ca5f37b7658177');
const myWalletAddress = mykey.getPublic('hex');


let Coin = new BlockChain();

let tx1 = new Transaction(myWalletAddress, 'khóa công khai ở đây', 10);
tx1.signTransaction(mykey);
Coin.addTransaction(tx1);

console.log("\nStarting the mine ....");
// chuyển phần thưởng
Coin.miniPendingTransactions(myWalletAddress);
console.log("\nBalance of tuan is: ", Coin.getBalanceOfAddress(myWalletAddress));

// Giả mạo thay đổi giao dịch
// giao dịch không hợp lệ nếu giả mạo
// Coin.chain[1].transactions[0].amount = 1; 


// Kiểm tra giao dịch
console.log("Is chain Valid ? : " + Coin.isChainValid());