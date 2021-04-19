// links
// state - https://disease.sh/v3/covid-19/gov/india
// https://disease.sh/v3/covid-19/countries/india
var totalCases = document.getElementById('total-cases');
var totalTodays = document.getElementById('total-todays');
var recovered = document.getElementById('recovered');
var recoveredTodays = document.getElementById('recovered-todays');
var deaths = document.getElementById('deaths');
var deathsTodays = document.getElementById('deaths-todays');

function start() {
    getCountryData();
    getDropDownState();
    getStatesData();
    // getChartData();
    getMap();
}

const getCountryData = async () => {
    await fetch("https://disease.sh/v3/covid-19/countries/india")
        .then(response => response.json())
        .then(data => {
            totalCases.innerHTML = data.cases;
            totalTodays.innerHTML = "+" + data.todayCases;
            recovered.innerHTML = data.recovered;
            recoveredTodays.innerHTML = "+" + data.todayRecovered;
            deaths.innerHTML = data.deaths;
            deathsTodays.innerHTML = "+" + data.todayDeaths;
        });
}

const onStateChange = async () => {
    var stateName = document.getElementById('dropDownStates').value;
    (stateName === "India")
        ? location.reload()
        : fetch('https://disease.sh/v3/covid-19/gov/india')
            .then(response => response.json())
            .then(data => {
                data.states.map((state) => {
                    if (state.state === stateName) {
                        totalCases.innerHTML = state.cases;
                        totalTodays.innerHTML = "+" + state.todayCases;
                        recovered.innerHTML = state.recovered;
                        recoveredTodays.innerHTML = "+" + state.todayRecovered;
                        deaths.innerHTML = state.deaths;
                        deathsTodays.innerHTML = "+" + state.todayDeaths;
                        getStateDimension(stateName);
                        // getStateISO(stateName);
                        (stateName == 'India') ? getStatesData() : getCityData(stateName)
                        // getChartData(state.state, caseType = 'cases');
                    }
                });
                ;
            });
}

const getStateISO = async (stateName) => {
    await fetch('./js/state_iso.json')
        .then(response => response.json())
        .then(data => {
            iso = data.states[stateName];
        })
    return iso;
}

const getCityData = async (stateName) => {
    await fetch('https://api.covid19india.org/state_district_wise.json')
        .then(response => response.json())
        .then(data => {
            let output = `<h4 class="card-title">Live cases by District in ${stateName}</h4>
            <tr class="row">
                <td class="col" style="background-color: white">District</td>
                <td class="col text-right" style="background-color: white"><span class="todays-cases">active</span> Cases</td>
            </tr>
            `;
            document.getElementById('state-table').innerHTML = output;
            let temp = data[stateName].districtData
            for (const state in temp) {
                $('#state-table').append(`
                <tr class="row">
                    <td class="col">${state}</td>
                    <td class="col text-right"> <span class="todays-cases">+${temp[state]["active"]}</span> ${temp[state]["confirmed"]}</td>
                </tr>
            `);
            }
        });
}

const getStatesData = async () => {
    await fetch('https://disease.sh/v3/covid-19/gov/india')
        .then(response => response.json())
        .then(data => {
            let output = '<h4 class="card-title">Live cases by states</h4>';
            output += `
                <tr class="row">
                    <td class="col">States</td>
                    <td class="col text-right" onclick="clickCount()"><span class="todays-cases">new</span> Cases <i class="fa fa-sort" aria-hidden="true"></i></td>
                </tr>
            `;
            data.states = (count % 2 == 0) ? sortDataReverse(data.states) : sortData(data.states);
            data.states.map((states) => {
                output += `
                            <tr class="row">
                                <td class="col"> ${states.state}</td>
                                <td class="col text-right"> <span class="todays-cases">+${states.todayCases}</span> ${states.cases}</td>
                            </tr> 
                    `;
            });
            document.getElementById('state-table').innerHTML = output;
        });
}

function getStateDimension(stateCode) {
    fetch('https://raw.githubusercontent.com/Dhaneshmonds/webiste-utilities/master/state-districts.json')
        .then(response => response.json())
        .then(data => {
            let count = 1;
            data.states.map((states) => {
                if (states.name == stateCode && count == 1) {
                    setMapMarker(map, states.coordinates[1], states.coordinates[0], states.name);
                    count++;
                }
            })
        })
}

var lat = 20.5937, lon = 78.9629;
var map;
var circle;
function getMap() {
    map = L.map('map').setView([lat, lon], 4);
    L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=U6FVrDyEWYXs6GFXl1mF', {
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    }).addTo(map);
}

function setMapMarker(map, lat, lon, stateCode) {
    map.setView([lat, lon], 5);
    circle = L.marker([lat, lon]).addTo(map);
    fetch('https://disease.sh/v3/covid-19/gov/india')
        .then(response => response.json())
        .then(data => {
            data.states.map((state) => {
                if (state.state === stateCode) {
                    circle.bindPopup(`
                    <h5>${stateCode}</h5>`).openPopup();;
                    map.setView([lat, lon]);
                }
            });
        })
}


const getDropDownState = async () => {
    await fetch('https://disease.sh/v3/covid-19/gov/india')
        .then(respose => respose.json())
        .then(data => {
            let output = `<option class="form-control" value="India" selected>India</option>`;
            data.states.map((states) => {
                output += `
                <option class="form-control" value="${states.state}">${states.state}</option>
                `;
            });
            document.getElementById('dropDownStates').innerHTML = output;
        });
}

const sortData = (states) => {
    const sortedData = [...states];
    return sortedData.sort((a, b) => (a.cases > b.cases ? -1 : 1));
}
const sortDataReverse = (states) => {
    const sortedData = [...states];
    return sortedData.sort((a, b) => (a.cases < b.cases ? -1 : 1));
}
let count = 1;
function clickCount() {
    count = ++count;
    getStatesData();
}

// let iso;
// const getChartData = async (state, caseType) => {
//     await fetch('https://api.covid19india.org/states_daily.json')
//         .then(response => response.json())
//         .then(data => {
//             var caseData = ['Confirmed', 'Recovered', 'Deceased'];
//             var casesByDate = [, ,];
//             var date = [, ,];
//             let i = data.states_daily.length
//             var count = 30;

//             if (caseType == 'cases') {
//                 caseType = caseData[0]
//             } else if (caseType == 'recovered') {
//                 caseType = caseData[1]
//             } else {
//                 caseType = caseData[2]
//             }

//             const getISO = async() => {
//                 await fetch('./js/state_iso.json')
//                 .then(response => response.json())
//                 .then(data => {
//                     let stateName = "";
//                     let isoCount = -1;

//                     while (state != stateName) {
//                         isoCount++;
//                         stateName = Object.keys(data.states)[isoCount];
//                     }
//                     iso = Object.values(data.states)[isoCount]
//                     console.log(iso)
//                 })
//             }
//             getISO();
//             console.log(iso + " iso")
//             // Object.keys(data.states_daily[0]).map((name) => {
//                 // console.log(name)
//             // })

//             while (count != 0) {
//                 i--;
//                 if (data.states_daily[i].status == caseType) {
//                         casesByDate.push(data.states_daily[i].iso);
//                         // console.log(data.states_daily[i])
//                         date.push(data.states_daily[i].date)
//                     count--
//                 }
//             }

//             var ctx = document.getElementById('myChart').getContext('2d');
//             var chart = new Chart(ctx, {
//                 type: 'line',
//                 data: {
//                     labels: date,
//                     datasets: [{
//                         label: caseType,
//                         backgroundColor: 'rgb(255, 99, 132)',
//                         borderColor: 'rgb(255, 99, 132)',
//                         data: casesByDate
//                     }]
//                 },
//                 options: {}
//             });
//         })
// }