const indexedDB = window.indexedDB
const form = document.getElementById('form')
const tasks = document.getElementById('tasks')

if(indexedDB && form){
    let db
    // .open abre la based de datos
    const request =indexedDB.open('tasksList',1)
    //                            nameBase, version
    request.onsuccess = ()=>{
        //Para saber si todo a ido bien
        db = request.result
        //      
        console.log('OPEN', db)
        readData()
    }
    request.onupgradeneeded = ()=>{
        //Si necesita actualizacion o si esta creada
        db = request.result
        console.log('Create', db)
        //creamos el almacen objectstore
        const objectStore = db.createObjectStore('Tareas', {
            keyPath: 'taskTitle'
        })
        //              name del almacen, y el indice con el nombre pasado por el input
    }
    request.onerror = (error)=>{
        //Para saber si hay error
        console.log('Error', error)
    }

    //------------------FUNCIONES-------------------------


    const addData = (data) =>{
        const transaction = db.transaction(['Tareas'], 'readwrite')
        //        db= base de datos     name de el almacen, lo que quiere hacer en este caso leer y escribir
        const objectStore = transaction.objectStore('Tareas')
        //              llamamos a la transaction
        console.log(transaction)
        console.log(objectStore)
        const request = objectStore.add(data)
        //se añade el dato al almacen con 'add'
    }

    const getData = (nameTask) =>{
        const newform = document.getElementById('newform')
        //console.log(newform.children[0].value)//Comando para ver el valor del elemento seleccionado
        
        newform.addEventListener('submit', (e)=>{
                e.preventDefault()
                if((e.target.newtask.value).length == 0 ){
                    console.log("No ingresaste datos")
                    /*const CerrarUpdate = document.getElementById('Cerrar-update')
                    CerrarUpdate.addEventListener('click', () =>{
                        cerrarModal()
                    })*/
                }else{
                    console.log("avanze")
                    const data = {
                        taskTitle: e.target.newtask.value,
                        taskPriority: e.target.newpriority.value
                    }
                    updateData(data, nameTask)
                    cerrarModal()
                }
            })
    }

    const abrirModal = (nameTask) =>{
        const modal = document.getElementById('Modal')
        modal.style.display = "flex"

        const formulario = document.getElementById('newform')
        formulario.addEventListener('click', (e)=>{
            //console.log(e.target.dataset.action)
            if (e.target.dataset.action == 'Actualizar') {

                getData(nameTask)
            }else if(e.target.dataset.action == 'Eliminar'){
                cerrarModal()
            }
        })
        //getData()
    }

    const cerrarModal = () =>{
        const modal = document.getElementById('Modal')
        modal.style.display = "none"
    }

    const updateData = (data, nameTask) =>{
        const transaction = db.transaction(['Tareas'], 'readwrite')
        const objectStore = transaction.objectStore('Tareas')
        const request = objectStore.add(data)
        // put busca el KEY y si existe lo actualiza sino lo añade
        deleteData(nameTask)
    }

    const deleteData = (data) =>{
        const transaction = db.transaction(['Tareas'], 'readwrite')
        const objectStore = transaction.objectStore('Tareas')
        const request = objectStore.delete(data)
        request.onsuccess = ()=>{
            readData()
        }
    }
    
    const sacardata = (titulotask) =>{
        const transaction = db.transaction(['Tareas'], 'readonly')
        const objectStore = transaction.objectStore('Tareas')
        const request = objectStore.openCursor()
        request.onsuccess = (e)=>{
            const cursor = e.target.result
            if(cursor){
                const nameTask = cursor.value.taskTitle
                const priorityTask = cursor.value.taskPriority
                if(titulotask == nameTask){
                    abrirModal(nameTask)
                }else{
                    cursor.continue() 
                }
            }
        }

    }

    const readData = () =>{
        const transaction = db.transaction(['Tareas'], 'readonly')
        //        db= base de datos     name de el almacen, lo que quiere hacer en este caso leer 
        const objectStore = transaction.objectStore('Tareas')
        //              llamamos a la transaction
        const request = objectStore.openCursor()
        //el cursor es un elemento que recorre el alamacen
        //el metodo opnecursor abre cursor y leer la info del almacen
        let containerSection = document.getElementById('tasks')
        containerSection.innerHTML = ''
        
        request.onsuccess = (e)=>{
            //el parametro e es el primer elemento del alamacen
            const cursor = e.target.result
            //guardamos el primer elemento del cursor en una cpnst cursor
            if(cursor){
                //console.log(cursor.value)
                //con el metodo continue seguimos leyendo la info del cursor hasta llegar al final del almacen
                const nameTask = cursor.value.taskTitle
                const priorityTask = cursor.value.taskPriority
                containerSection.innerHTML += `
                <div class="Task-Key ${priorityTask}">
                    <h3 class="Letter-Task">${nameTask}</h3>
                    <button class="button actu" name="button" data-action="update">Actualizar</button>
                    <button class="button elim" name="button" data-action="delete">Eliminar</button>
                </div>
                `
                cursor.continue()

            }else{
                console.log('Ya no hay mas datos')
            }
        }
    }

    //----------------FIN FUNCIONES------------------------


    form.addEventListener('submit', (e)=>{
    //escuchar el formulario, e es el elemento del click
        e.preventDefault()
            //console.log(e.target)
            //console.log(e.target.task)
            //console.log(e.target.task.value)
        if((e.target.task.value).length == 0 ){
            console.log("No ingresaste datos")
        }else{
            const data = {
                taskTitle: e.target.task.value,
                taskPriority: e.target.priority.value
            }
            addData(data)
            readData()
        }
    })
    tasks.addEventListener('click', (e) => {
        console.log(e.target)
        if (e.target.dataset.action == 'update') {
            //console.log(e.target.parentNode.firstChild.nextSibling.innerHTML)
            //console.log(e.target.parentNode.children[0].textContent)//el contenido del dato que deseas actualizar
            const titulotask = e.target.parentNode.children[0].textContent
            sacardata(titulotask)
        }else if(e.target.dataset.action == 'delete'){
            //console.log(e.target.parentNode.firstChild.nextSibling.innerHTML)
            //deleteData(e.target.dataset.key)
            const titulotask = e.target.parentNode.children[0].textContent
            deleteData(titulotask)
        }
    })
}