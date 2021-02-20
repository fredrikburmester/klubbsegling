function unRegisterForRace(id, el) {
    axios.post('/un-register-for-race/' + id, {
        headers: {

        }
    }).then(response => {
        if (response.status == 200) {
            

            window.createNotification({
                closeOnClick: false,
                displayCloseButton: false,
                positionClass: "nfc-bottom-right",
                showDuration: 5000,
                theme: 'warning'
            })({
                title: "Avregistrerad",
                message: "Du är nu avregistrerad på tävlingen"
            });
            
            user.races = user.races.filter(e => e !== id); // will return ['A', 'C']
            el.innerHTML = "Registrera"
            el.classList.remove("btn-danger")
            el.classList.add("btn-primary")
            el.addEventListener('click', function handler() { 
                registerForRace(id, this)
                this.removeEventListener('click', handler);
            });
        } else {

            window.createNotification({
                closeOnClick: false,
                displayCloseButton: false,
                positionClass: "nfc-bottom-right",
                showDuration: 5000,
                theme: 'error'
            })({
                title: "Tyvärr!",
                message: response.data.response.errors[0].msg
            });
        }
    }).catch(error => console.error(error));
}

function registerForRace(id, el) {
    console.log(el)
    axios.post('/register-for-race/' + id, {
        headers: {

        }
    }).then(response => {
        if (response.status == 200 && response.data.response.success == true) {
            window.createNotification({
                closeOnClick: false,
                displayCloseButton: false,
                positionClass: "nfc-bottom-right",
                showDuration: 5000,
                theme: 'success'
            })({
                title: "Registrerad",
                message: "Du är nu registrerad på tävlingen"
            });

            user.races.push(id)
            el.innerHTML = "Avregistrera"
            el.classList.remove("btn-primary")
            el.classList.add("btn-danger")
            el.addEventListener('click', function handler() { 
                unRegisterForRace(id, this)
                this.removeEventListener('click', handler);
            });
        } else {
            console.log(response.data.response.errors)
            window.createNotification({
                closeOnClick: false,
                displayCloseButton: false,
                positionClass: "nfc-bottom-right",
                showDuration: 5000,
                theme: 'error'
            })({
                title: "Tyvärr!",
                message: response.data.response.errors[0].msg
            });
        }
    }).catch(error => console.error(error));
}