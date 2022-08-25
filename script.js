'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// let mapEvent;
// let map;


class Workout{
    
    constructor(coords, distance,duration){
        this.date =  new Date();
        this.id = (Date.now() + '').slice(-10);
        this.coords= coords ; 
        this.distance= distance;
        this.duration= duration;
        
    }
    calcDiscription(){
      // prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      this.discription = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[(new Date().getMonth())]} ${(new Date().getDate())}`
    }
}
const work= new Workout(2,5)
console.log(work);
class Running extends Workout{
    constructor(coords, distance,duration,cadence){
        super(coords, distance,duration);
        this.cadence= cadence;
        this.type= 'running';
        this.calcPace();
        this.calcDiscription();
    }
    calcPace(){
      this.pace= this.duration/this.distance;
      return this.pace;
    }
}

class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain){
        super(coords, distance,duration);
        this.elevationGain= elevationGain;
        this.type = 'cycling';
        this.calcSpeed();
        this.calcDiscription()
    }
    calcSpeed(){
      this.speed= this.distance/(this.duration/60);
      return this.speed;
    }
}
class App {
    constructor(){
      this._getPosition();      
      form.addEventListener('submit',this._newWorkOut.bind(this));
      inputType.addEventListener('change',this._toggleElevationFields);
      this.workouts=[];
      this._getLocalStorage();
      this._map;
      this._mapEvent;
      containerWorkouts.addEventListener('click', this._moveMarker.bind(this));
      
    }
    _getPosition(){
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
        alert(`Can't get your position`);
    });
    }
    _loadMap(position){

        const {latitude} =position.coords;
        const {longitude} =position.coords;
        const coords = [latitude, longitude];
         this._map = L.map('map').setView(coords, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this._map);

        this._map.on('click', this._showForm.bind(this));     
        this.workouts.forEach(work => this._setmarker(work));  
    }
    _showForm(e){    
        this._mapEvent=e;
        form.classList.remove('hidden');
        inputDistance.focus();
    }
    _toggleElevationFields(){
     
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
}
    
    _newWorkOut(e){
      
        e.preventDefault();
        console.log(e);
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const valid = (...inputs)=> inputs.every(input => Number.isFinite(input));
        const validPositive = (...inputs) => inputs.every(input => input>0);
        const {lat, lng}=this._mapEvent.latlng;
        let workout;

            if (type ==='running'){
              const cadence = +inputCadence.value;
              
              if(!valid(distance,duration,cadence) || !validPositive(distance,duration,cadence)){
                return alert('enter positive number');
              }
                workout = new Running([lat, lng], distance, duration, cadence);
               this.workouts.push(workout);
                
            }
            if (type ==='cycling'){
              const elevation = +inputElevation.value;
              if(!valid(distance,duration,elevation) || !validPositive(distance,duration)){
                return alert('enter positive number');
              }
                workout = new Cycling([lat, lng], distance, duration, elevation);
               this.workouts.push(workout);
            }
            this._renderWorkOut(workout);
        
          this._setmarker(workout);
         inputDistance.value=inputDuration.value=inputCadence.value=inputElevation.value='';
         this._setLocalStorage();
    }
    _setmarker(workout){
      L.marker(workout.coords).addTo(this._map)
            .bindPopup(
                L.popup({
                    maxWidth:250,
                    minWidth:100,
                    autoClose:false,
                    closeOnClick:false,
                    className:`${workout.type}-popup`,
                })
            )
            .setPopupContent(`${workout.discription}`)
            .openPopup(); 
    }
    _renderWorkOut(workout){
      let html = `<li class="workout workout--${workout.type}" data-id=${workout.id}>
                <h2 class="workout__title">${workout.discription}</h2>
                <div class="workout__details">
                  <span class="workout__icon">🏃‍♂️</span>
                  <span class="workout__value">${workout.distance}</span>
                  <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">⏱</span>
                  <span class="workout__value">${workout.duration}</span>
                  <span class="workout__unit">min</span>
                </div>`
                if(workout.type ==='running')
                html += `<div class="workout__details">
                  <span class="workout__icon">⚡️</span>
                  <span class="workout__value">${workout.pace.toFixed(2)}</span>
                  <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">🦶🏼</span>
                  <span class="workout__value">${workout.cadence}</span>
                  <span class="workout__unit">spm</span>
                </div>
              </li>`;
              if (workout.type ==='cycling')
                  html += `<div class="workout__details">
                  <span class="workout__icon">⚡️</span>
                  <span class="workout__value">${workout.speed}</span>
                  <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">⛰</span>
                  <span class="workout__value">${workout.elevationGain}</span>
                  <span class="workout__unit">m</span>
                </div>
              </li> `
              form.insertAdjacentHTML('afterend',html);
              form.style.display='none' ;
              form.classList.add('hidden');
              setTimeout(() => form.style.display='grid',1000) ;
    }
    _moveMarker(e){
     const clicked = e.target.closest('.workout');
     if(!clicked) return ;
     console.log(clicked);
     const tak = this.workouts.find(work => work.id === clicked.dataset.id);
     console.log(tak);
     this._map.setView(tak.coords,13,{
      animate:true,
      pan:{
        duration:1
      }
     })
    }
    _setLocalStorage(){
      localStorage.setItem('workouts',JSON.stringify(this.workouts));
    }
    _getLocalStorage(){
      const data = JSON.parse(localStorage.getItem('workouts')) ;
      if(!data) return ;
      this.workouts= data;
      this.workouts.forEach(work => this._renderWorkOut(work));
    }
    reset(){
      localStorage.removeItem('workouts');
      location.reload();
    }
}

const app1 = new App();
