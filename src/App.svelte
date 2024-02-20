<script>
mapboxgl.accessToken = "pk.eyJ1Ijoia3F0cmFuIiwiYSI6ImNsc2t6eXQ4czA3dmcyanJ5eWhoaWQxeHIifQ.2kwe8rDh1r-X61ULATh_Jg";

const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/kqtran/clstfey1b000401pt3anhava7" ,  
        center: [-79.035728, 35.932522], // Chapel Hill Public Library
        zoom: 3,
        minZoom: 2,
        maxZoom: 5,
    });


map.on('load', () => {
  // the rest of the code will go in here

    const layers = [
    '0-3500',
    '3500-7000000',
    '7000000-90000000',
    '90000000-180000000',
    '180000000-300000000',
    '300000000+',
    ];
    const colors = [
    '#ebecd4',
    '#eef1bc',
    '#b6d5a6',
    '#6fbd6b',
    '#93a6a9',
    '#ad8fea',
    ];

    const legend = document.getElementById('legend');

    layers.forEach((layer, i) => {
        const color = colors[i];
        const item = document.createElement('div')
        const key = document.createElement('span');
        key.className = 'legend-key';
        key.style.backgroundColor = color;

        const value = document.createElement('span');
        value.innerHTML = `${layer}`;
        item.appendChild(key);
        item.appendChild(value);
        legend.appendChild(item)
    }); 


    map.on('mousemove', (event) => {
    const countries = map.queryRenderedFeatures(event.point, {
        layers: ['population']
    });
    const population = countries.length ? countries[0].properties.population : undefined;
    document.getElementById('pd').innerHTML = population !== undefined
        ? `<h3>${countries[0].properties.country}</h3><p><strong>${population}</strong> people</p>`
        : `<p>Hover over a country!</p>`;
});


    map.getCanvas().style.cursor = 'default';

    




});




</script>

<main>


</main>