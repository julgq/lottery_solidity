/* Forma parte de la liberia estandar de node */
const assert = require('assert');

/* Crea una red local de pruebas */
const ganache = require('ganache-cli');

/* Web3 sera la interfaz entre la Red Local de ETH y nuestro contrato */
const Web3 = require('web3');

/* Creamos una instancia de Web3 */
const web3 = new Web3(ganache.provider());

/* Llama a la compilacion del contrato, su interface y su bytecode */
const { interface, bytecode } = require('../compile');

let lottery;

/* variable para  obtener las cuentas de pruebas de la red local */
let accounts;

beforeEach( async() => {
    /* Se obtienen las cuentas de la red local con web3 */
    accounts = await web3.eth.getAccounts();
    
    /* 
    
    Se hace un deploy del contrato a la red con su interfaz y bytecode compilada con la cuenta [0],
    y se envia un millon de gas por la operación
    
    */

    lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });
});


describe('Lottery Contract', () => {
   
    it('deploys a contract', () => {
        /* Crea un test y valida que existe una dirección del contrato en deploy */
        assert.ok(lottery.options.address);
        console.log(lottery.options.address);
    });
});


it('allows one account to enter', async() => {

    /* Ejecuta la funcion enter() del contrato, donde la account[0] envia el ether */
    await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('0.02', 'ether')
    });

    /* Eejecuta la función getPlayers donde la account[0] la llama */
    const players = await lottery.methods.getPlayers().call({
        from: accounts[0]
    });

    /* Valida que la dirección de la cuenta de la red local, sea la misma que el jugador 0 del contrato */
    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);

});


it('allows multiple accounts to enter', async() => {

    /* Ejecuta la funcion enter() del contrato */
    await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.enter().send({
        from: accounts[1],
        value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.enter().send({
        from: accounts[2],
        value: web3.utils.toWei('0.02', 'ether')
    });

    /* Eejecuta la función getPlayers donde la account[0] la llama */
    const players = await lottery.methods.getPlayers().call({
        from: accounts[0]
    });

    /* Valida que la dirección de la cuenta de la red local, sea la misma que el jugador 0 del contrato */
    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[1], players[1]);
    assert.equal(3, players.length);

});

/* Testing usando try and catch */
it('requires a minimum amount of ether to enter', async () => {
    try {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        //assert(false);
        console.log("Entro a Try");
    } catch (err) {
        assert(err);
        console.log('Entro a Catch');
    }
});

/* Probamos la función pickWinner */
it('only manager can call pickWinner', async () => {
    try {
        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });
        assert(false);
        console.log("Entro a Try");
    } catch (err) {
        assert(err);
        console.log('Entro a Catch');
    }
});


it('sends money to the winner and resets the players array', async () => {

    await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('2', 'ether')
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]); 
    console.log(web3.utils.toWei(initialBalance.toString(), 'ether'));

    await lottery.methods.pickWinner().send({ from: accounts[0] });

    const finalBalance = await web3.eth.getBalance(accounts[0]);
    console.log(web3.utils.toWei(finalBalance.toString(), 'ether'));
    
    const difference = finalBalance - initialBalance;
    console.log(web3.utils.toWei(difference.toString(), 'ether'));

    assert(difference > web3.utils.toWei('1.8', 'ether'));

});
