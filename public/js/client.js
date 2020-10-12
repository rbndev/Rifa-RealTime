var socket = io();

for(i=0;i<1000;i++){
    var node = document.createElement("LI");
    node.setAttribute("id", `${i}`);
    node.classList.add("open");
    node.dataset.status = "open";
    var textnode = document.createTextNode(`${i}`);
    node.appendChild(textnode);
    document.getElementById("lista-bilhetes").appendChild(node);
    node.addEventListener("click", function(e) {
        socket.emit('selecionar', e.target.id);
    });
}

socket.on('listagem', function (valor){
    Object.entries(valor).forEach(([key, value]) => {
        var el = document.getElementById(value.num);

        el.classList.remove('open');
        el.classList.add(value.status);
        el.dataset.nome = value.nome;
        el.dataset.status = value.status;
    });
});

socket.on('add', function (cadastrado){
    var el = document.getElementById(cadastrado.num);

    el.classList.remove('open');
    el.classList.remove('closed');
    el.classList.remove('reserved');
    el.classList.add(cadastrado.status);
});

socket.on('deletado', function (valor){
    var el = document.getElementById(valor);

    el.classList.remove('open');
    el.classList.remove('reserved');
    el.classList.remove('closed');
    el.classList.add('open');
});

socket.on('reservado', function (cadastrado){
    var el = document.getElementById(cadastrado.num);

    el.classList.remove('open');
    el.classList.remove('closed');
    el.classList.remove('reserved');
    el.classList.add(cadastrado.status);
});

socket.on('aprovado', function (aprovado){
    var el = document.getElementById(aprovado);

    el.classList.remove('open');
    el.classList.remove('closed');
    el.classList.remove('reserved');
    el.classList.add("closed");
});

socket.on('actions', function(status, nome, num, cpf, tel){
    switch(status){
        case "closed":
            Swal.fire({
                        title: `${num} Utilizado.`,
                        icon: 'error',
                        html: `        
                            Utilizado por: 
                            ${nome}<br>
                            (${tel.substr(0,2)})  ${tel.substr(2,3)}*-****
                            
                            `,
                            focusConfirm: false,
                            confirmButtonColor: "#ff6666",
                            confirmButtonText: "SAIR",
                    });
        break;
        case "reserved":
            Swal.fire({
                        title: `${num} Reservado.`,
                        icon: 'warning',
                        html: `        
                            Reservado por:<br>
                            Nome: ${nome}<br>
                            Cpf: ${cpf}<br>
                            Tel: ${tel}<br><br>`,
                            focusConfirm: false,
                            confirmButtonColor: "#ff6666",
                            confirmButtonText: "SAIR",
                    });
        break;
        default:
            Swal.fire({
                        title: `${num} Disponível.`,
                        icon: 'success',
                        html: `   
                            <input id="nome" placeholder="Seu nome" type="nome" class="swal2-input" maxlenght="4">
                            <input id="cpf" placeholder="CPF" type="nome" class="swal2-input" maxlenght="4">
                            <input id="tel" placeholder="Telefone" type="tel" class="swal2-input" maxlenght="4">          
                            `,
                        focusConfirm: false,
                        showCancelButton: true,
                        confirmButtonColor: "#66ff66",
                        cancelButtonColor: "#ff6666",
                        confirmButtonText: "ADICIONAR",
                        cancelButtonText: "Cancelar",
                        preConfirm: () => {
                            var nome = document.getElementById('nome').value;
                            var cpf = document.getElementById('cpf').value;
                            var tel = document.getElementById('tel').value;
                            var cadastro = {num: num, nome: nome, cpf: cpf, tel: tel}
                            socket.emit("reservar", cadastro);
                        }
                    });
    }
});

socket.on('alertas', function (alert){
    switch(alert){
        case "deletado":
            Swal.fire({
                title: `Deletado`,
                icon: 'error',
                text: 'Número deletado com Sucesso!',
            });        
        break;
        case "":
        break;
        case "":
        break;
    }
});