pragma solidity ^0.4.17;
 
/* Nombre del contracto se define tipo como una Clase */
contract Lottery {
    
    /* Adress de quien crear el contrato */
    address public manager;
    
    /* Adress de los jugadores */
    address[] public players;
    
    /* Funcion constructura del contrato */
    function Lottery() public {
        manager = msg.sender;
        
    }
    
    /* funcion enter() la cual hace que el jugador envie ehter, y se introduzca un jugador */
    function enter() public payable {
        
        require(msg.value > .01 ether);
        
        players.push(msg.sender);
    }
    
    /* Simulacion de funcion generador de numero aleatorio */
    function random() public view returns (uint) {
        // keccak256(); es lo mismo que sh3()
        return uint(keccak256(block.difficulty, now, players));
    }
    
    /* Funcion para selecionar el ganador y vaciar el array dinamico de direcciones */
    function pickWinner() public restricted {
        uint index = random() % players.length;
        players[index].transfer(this.balance);
        players = new address[](0);
    }
    
    /* Crear un modificar ayuda a reutilizar Codigo */
    modifier restricted() {
        // con este require, estoy diciendo que solo el creador del contrato puede seleccionar ganador.
        require(msg.sender == manager);
        _;
    }
    
    function getPlayers() public view returns (address[]) {
        return players;
    }
    
    
}
