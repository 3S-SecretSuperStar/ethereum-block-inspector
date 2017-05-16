const abiDecoder = require('abi-decoder');
let fs = require('fs');

export interface Inspectable {
    inspect(tx: any, txr: any, findings: Map<String, Object>): void;
}

export class CommonPropsInsp implements Inspectable {

    inspect(tx: any, txr: any, findings: Map<String, Object>) {
        findings.set("hash", tx.hash);
        findings.set("blockNumber", txr.blockNumber);
        findings.set("from", tx.from);
        findings.set("to", tx.to);
        findings.set("value", tx.value);
    }
}

export class OutOfGasInsp implements Inspectable {

    inspect(tx: any, txr: any, findings: Map<String, Object>) {
        let gas: number = tx.gas;
        let gasUsed: number = txr.gasUsed;
        var outOfGas = gas == gasUsed;

        findings.set("outOfGas", outOfGas);
        findings.set("gasUsed", gasUsed);
        findings.set("gas", gas);
    }
}

export class ContractCreateInsp implements Inspectable {

    inspect(tx: any, txr: any, findings: Map<String, Object>) {
        findings.set("createContract", tx.to == null);
    }
}

export class MethodSignatureInsp implements Inspectable {

    inspect(tx: any, txr: any, findings: Map<String, Object>) {
        findings.set("methodSig", tx.input.substring(0, 10));
    }
}

export class MethodNameInsp implements Inspectable {

    private methodIdMap: Map<String, any>;
    private address: String;

    constructor(abiPath: String, address: String) {
        this.address = address;

        let fileAbi = fs.readFileSync(abiPath);
        let abiObj = JSON.parse(fileAbi);

        abiDecoder.addABI(abiObj);
        this.methodIdMap = abiDecoder.getMethodIDs();
    }

    inspect(tx: any, txr: any, findings: Map<String, Object>) {

        var method = abiDecoder.decodeMethod(tx.input);
        if (!method) {
            findings.set("methodName", "Method Hash not found in the ABI!");
            return;
        }

        findings.set("methodName", method.name);

        for (let i = 0; i < method.params.length; i++) {
            findings.set("paramN" + i, method.params[i].name);
            findings.set("paramV" + i, method.params[i].value);
            findings.set("paramT" + i, method.params[i].type);
        }
    }
}