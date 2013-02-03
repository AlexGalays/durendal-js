(function() {

var List      = Collection.List,
    range     = Collection.range,
    gibberish = makeGibberish(),
    id        = 0,
    articles  = makeArticles(50),
    original  = articles.clone();


var renderArticles = Render(articles).into('ul')
  .addedAnimation('added').removedAnimation('removed')
  .added(added).key('id');

render();

function added(node, d) {
  $(node).find('.gender').addClass('icon-' + d.gender).css('background', d.color)
    .end().find('.title').text(d.title);
}


$('ul').on('click', '.icon-delete', deleteArticle);

$('#addTop').click(addTop);
$('#addRandom').click(addRandom);

$('#removeTop').click(removeTop);
$('#removeRandom').click(removeRandom);

$('#shuffle').click(shuffle);
$('#filter').click(filter);
$('#reset').click(reset);


function deleteArticle() {
  articles.remove(Render.dataFor(this.parentNode));
  render();
}

function addTop() {
  range(randomInt(4)).each(function() {
    articles.addAt(makeArticle(), 0);
  });

  scrollToTop();
  render();
}

function addRandom() {
  range(randomInt(8)).each(function() {
    articles.addAt(makeArticle(), randomInt(articles.size()));
  });

  render();
}

function removeTop() {
  articles = articles.drop.bind(articles)(randomInt(4));

  scrollToTop();
  render();
}

function removeRandom() {
  if (articles.size() == 1) 
    articles.removeFirst();
  else 
    range(randomInt(8)).each(function() {
      articles.removeAt(randomInt(articles.size()));
    });

  render();  
}

function reset() {
  articles = original.clone();
  render();
}

function shuffle() {
  shuffleArray(articles.items);
  render();
}

function filter() {
  articles = articles.filter(function() {return Math.random() > 0.7;});
  render();
}

function render() {
  renderArticles(articles);
  $('#articleCount').text(articles.size());
}

function scrollToTop(container) {
  $('body, html').scrollTop(0);
}


function makeArticles(count) {
  return range(count).map(makeArticle);
}

function makeArticle() {
  var r = Math.random();

  return {
    id: id++,
    title: gibberish(),
    gender: (r > 0.5) ? 'male' : 'female',
    color: avatarColor(r)
  };
}

function makeGibberish() {
  var words = List(
    'the', 'a', 'is', 'was', 'will', 'be', 'go', 'dragon', 'flower',
    'fluid', 'amazing', 'family', 'danger', 'outstanding',
    'barbarian', 'red', 'blue', 'green', 'peculiar', 'always',
    'catfish', 'ugly', 'sick', 'tree', 'moon', 'greased',
    'fish and chips', 'curry', '50', '100', '38', 'please', 'turtle',
    'pretty', 'solid', 'no', 'true', 'expanded', 'cheap', 'bag',
    'monsieur', 'article', 'business', 'serious', 'magic', 'evil'
    );

  return function() {
    shuffleArray(words.items);
    return words.take(4).mkString('', ' ', '');
  };
}

function avatarColor(seed) {
  var h = parseInt(360 * seed);
  return 'hsl(' + h + ', 80%, 70%)';
}

function randomInt(max) {
  return Math.floor(Math.random() * max + 1);
}

function shuffleArray(array) {
  var m = array.length, temp, i;
  while(m) {
    i = Math.random() * m-- | 0;
    temp = array[m];
    array[m] = array[i]; 
    array[i] = temp;
  }
};

})();