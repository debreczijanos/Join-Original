let allContacts = [
  {
    nickname: 'bill',
    firstName: "Bill",
    lastName: "Stevens",
    number: "07872937209",
    address: ['Park Road', 'Blaby', 'Leicester', 46]
  },
  {
    nickname: 'bill',
    firstName: "William",
    lastName: "Fisher",
    number: "078729234209",
    address: ['Moose Road', 'Whitby', 'Yorkshire', 146]
  },
  {
    nickname: 'steve',
    firstName: "Steve",
    lastName: "Elliott",
    number: "07970943757",
    address: ['Park Road2', 'Blaby2', 'Leicester2', 462]
  }
];


function renderContacts(){
    let contacts = document.getElementById('prototype'); 
    contacts.innerHTML = ``; 

    for (let i = 0; i < 1; i++) {
      document.getElementById('prototype').innerHTML += showRenderContacts(allContacts, i);
    }
}


function showRenderContacts(allContacts, i){
    return /*html*/`


    <div class="white-box">

      <div class="contact-baloon">Test</div>

      <div>
        <h3>Name Surname</h3>
        <span>mail adresse</span>
      </div>
      

      </div>

    </div>`; 
    
    
    
    
    
    // hier sollen die Kontakte dargestellt werden. Man könnte eine Liste separat erstellen und es wie bei der PokeAPI fetchen. (falls das möglich ist) Suchfunktion sollte hinzugefügt werden. 
}


