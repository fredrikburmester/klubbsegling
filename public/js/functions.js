function unRegisterForRace(id) {
    axios.post('/un-register-for-race/' + id, {
        headers: {
          
        }
    }).then(response => { 
        if(response.status == 200) {
           alert("Du är nu avregistrerad")
           user.races = user.races.filter(e => e !== id); // will return ['A', 'C']
           getRaces(year, club, serie)
        } else {
            alert("Nått gick snett!")
        }
    }).catch(error => console.error(error));
}

function registerForRace(id) {
    axios.post('/register-for-race/' + id, {
        headers: {
          
        }
    }).then(response => { 
        if(response.status == 200) {
            alert("Du är nu registrerad")
            user.races.push(id)
            getRaces(year, club, serie)
        } else {
            alert("Nått gick snett!")
        }
    }).catch(error => console.error(error));
}