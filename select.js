(function() {

var List = Collection.List,
    Seq  = Collection.Seq;

var continents = List(
  {
    name: 'Africa', 
    countries: List(
    {
      name: 'Angola',
      cities: List('Huambo', 'Kuito', 'Calai')
    },
    {
      name: 'Cameroon',
      cities: List('Daoula', 'Garoua', 'Maroua')
    })
  },
  {
    name: 'Europe',
    countries: List(
    {
      name: 'Cyprus',
      cities: List('Larnaca', 'Morphou', 'Kiti')
    },
    {
      name: 'Latvia',
      cities: List('Riga', 'Kuldiga', 'Livani')
    })
  }
);

var renderContinents = Render(continents).into('#continent').each(update)();
var renderCountries  = Render().into('#country').each(update);
var renderCities     = Render().into('#city').each(update);

$('#continent').change(function() {
  renderCountries(continents.findBy('name', this.value).countries);
});

$('#country').change(function() {
  renderCities(Seq(renderCountries.data()).findBy('name', this.value).cities);
});

$('#continent, #country, #city').change(function() {
  $('#selection').text(
    $('#continent').val() + ' / ' +
    $('#country').val() + ' / ' +
    $('#city').val()
  );
});

// Don't do that at home
$('#continent, #country').change();

function update(node, data) {
  $(node).val(data.name || data).text(data.name || data);
}

})();