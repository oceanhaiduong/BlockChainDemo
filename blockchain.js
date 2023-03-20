const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Lớp giao dịch 
class Transaction{
    constructor(fromAdress, toAdress, amount){
        this.fromAdress = fromAdress; 
        this.toAdress = toAdress;
        this.amount = amount;
    }


    // hàm tính toán hàm băm khóa
    caculateHash(){
        return SHA256(this.fromAdress + this.toAdress + this.amount).toString();
    }

    // Hàm ký giao dịch ( ký khóa )
    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAdress){
            throw new Error('Bạn không thể ký giao dịch cho ví khác');
        }
        const hashTx = this.caculateHash();
        const sig = signingKey.sign(hashTx,'base64');
        this.signature = sig.toDER('Hex');
    }


    // Kiểm tra hợp lệ
    isValid(){
        if(this.fromAdress === null) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error('Không có chữ ký trong giao dịch này');
        }

        const publickey = ec.keyFromPublic(this.fromAdress, 'hex');
        return publickey.verify(this.caculateHash(), this.signature);
    }

}

class Block{
    // transactions: Bao gồm các dữ liệu bất kỳ 
    // previousMash : chuỗi băm trước của 1 block
    constructor(timestamp, transactions , previousMash = ''){
        this.timestamp = timestamp;
        this.transactions  = transactions ;
        this.previousMash = previousMash;
        this.hash = this.caculateHash();
        this.nonce = 0;
    }

    // tính toán xử lý hàm băm
    caculateHash(){
        return SHA256(this.previousMash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    // Độ khó của mã  khối 
    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) != Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.caculateHash();
        }

        console.log("Block mined: " + this.hash);
    }

    // kiểm tra
    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid){
                return false;
            }
        }
        return true;
    }
    
}

class BlockChain{
    constructor(){
        this.chain  = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = []; // chứa giao dịch chờ xử lý
        this.miningReward = 100; // Phần thưởng khai thác thành công một khối
    }

    // Hàm Tạo block 
    createGenesisBlock(){
        return new Block(Date.parse("2022-11-03"), [], "0");
    }

    // Hàm lấy block cuối cùng
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    // Địa chỉ gửi phần thưởng nếu khai thác thành công
    miniPendingTransactions(miningRewardAddress){
        // Gưi phần thưởng giao dịch ....  đia chỉ người nhận, số phần thưởng mặc định
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("Block success mined");
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];

    }


    // Hàm tạo giao dịch 
    addTransaction(transaction){

        if(!transaction.fromAdress || !transaction.toAdress){
            throw new Error('Giao dịch phải bao gồm địa chỉ từ và đến');
        }

        if(!transaction.isValid()){
            throw new Error('Không thể thêm giao dịch không hợp lệ vào chuỗi');
        }

        this.pendingTransactions.push(transaction);
    }
    
    // Hàm lấy số dư của các nhân theo các giao dịch
    getBalanceOfAddress(adress){
        let balance = 0;
        // 1 chain có nhiều block
        // Trong block sẽ có nhiều giao dịch
        for(const block of this.chain){
            for(const trans of block.transactions){
                // Mếu chuyển cho người khác thì trừ số dư
                if(trans.fromAdress === adress){
                    balance -= trans.amount;
                }

                // Nhân nhận từ người khác thì cộng vào số dư
                if(trans.toAdress === adress){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    // Hàm kiểm tra hợp lệ của chuỗi block
    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Kiểm tra ...
            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            // Kiểm tra xem hàm băm của block trùng nhau hau không
            if(currentBlock.hash !== currentBlock.caculateHash()){
                return false;
            }

            // Kiểm tra mã hàm băm của khối trước đó co chính xác với khối hiện tại hay không
            if(currentBlock.previousMash !== previousBlock.hash){
                return false;
            }
        }
        return true;
    }
}


module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;