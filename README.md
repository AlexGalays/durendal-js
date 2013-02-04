# durendal-js
Simple node based list templating.

# Content
* [Code examples](#code-examples)
* [Dependencies](#dependencies)
* [Usage guide](#usage-guide)
* [Sales pitch](#sales-pitch)
* [Durendal?](#durendal)

<a name="code-examples"></a>
# Code examples

## Rendering a simple text list
```html
<ul></ul>
```

```javascript
var names = ['Mike', 'Walt', 'Jesse'];

Render(names).into('ul').each(
   function(node, name) {node.textContent = name;})();
```

## Rendering three red squares

```html
<div id="squares">
   <div class="template"></div>
</div>
```

```css
#squares div {
   background: red;
   width: 100px;
   height: 100px;
}
```

```javascript
Render([1, 2, 3]).into('#squares')();
```

## Rendering the options of a select control

[Full example](http://alexgalays.github.com/durendal-js/select.html)

## Complete example with CSS animations

[Full example](http://alexgalays.github.com/durendal-js/list.html)


<a name="dependencies"></a>
# Dependencies

Durendal only depends on JQuery (But the script order doesn't matter).  
There is an optional dependency on my other library `collection-js`, so you can directly pass a `List` or `ArrayMap` to be rendered.


<a name="usage-guide"></a>
# Usage guide

## Basic setup

The Render global function takes an Array of data (Or a List/ArrayMap from collection-js) you want to render:

```javascript
Render(data)
```

It returns a render function onto which you set all initial parameters, such as 
`into` which should be a JQuery selector used to select the container parenting
the templated data. Note that only the first matched container is used.

```javascript
Render(data).into('#sideBar ul')
// or
Render(data).into(nodeRef)
```

By convention, the only child of that container should be a single element with a className including "template".
Note that for the select, ul and ol controls, if you do not specify a template, an option or li element will be used.

```html
<ul>
   <li class="template">
      content
   </li>
</ul>
```

If you would like the rendering to occur immediately, you simply call the render function inline:

```javascript
Render(data).into('#sideBar ul')()
```

You can store a reference to the render function to re-render at any time:

```javascript
var render = Render(data).into('#sideBar ul') // Stores a ref
var render = Render(data).into('#sideBar ul')() // Stores a ref and render immediately
```

Later, you can call your render function with either new data or not:

```javascript
render(data) // Re-renders data or another data altogether
// or
render() // Renders reusing the last data passed
```

The more functional inclined among you may want to pass a function to `Render` instead of a direct data reference.
Passing a function achieves late binding and generally reduce the amount of state you have to keep around.
The function can produce a `null`, an `Array`, a `List` or an `ArrayMap`.

```javascript
var render = Render(people).into('ul')();

function people() {
   return paginated(allPeople).filter(activeFilter).sort(activeSort);
}

// Then later call render() whenever the user changes a parameter.
```

## The callbacks

```javascript
Render().into()
  .added(func).removed(func).each(func)
```

`added` is called everytime a DOM node is created and added  
`removed` is called everytime a DOM node is removed  
`each` is called for each node/data everytime render() is called  

The callback signature is `function(node, data, index)`  

What you can and should do with these callbacks depends on whether you set a `key`.

## The key

```javascript
Render().into().key(StringOrFunction)
```

(Note: If you used d3.js before, you probably already know this concept)  
The key is a very important parameter that you may want to set to correctly bind your data to the DOM.  

The rule of thumb is: Set a key if you want to use animations  

### What happens if you do not specify a key (The default)

In this mode, DOM nodes are bound to the data by index.
Example: DOM node [2] will be bound to datum [2] but if that datum moves somewhere else in the Array or get removed, DOM node [2] will be recycled
to display the new datum [2], if available.
That means there is no data continuity, and will make the majority of animations meaningless.
In this mode, nodes are recycled so you must use `each` to update your display from your data (`added` and `removed` will only ever be called when the Array changes in size, not when its content evolves)

### What happens if you specify a key

In this mode, DOM nodes are bound to the data by key, and this binding never changes. 
If the data moves in the Array, the associated node will move accordingly.

The key parameter accepts two notations:

```javascript
Render().into().key('id') // Assuming an Array of Objects is used, the field of the key to be used
Render().into().key(function(person) {return person.stuff.email;}) // The email will be used as the key
```

The key must be unique across the data.  

Now that DOM nodes know which data they represent, all animations will work as expected.  
Also, we now have access to some interesting optimizations   
The `added` callback can be used to setup the initial appearance and invariants of a node and
we can either use `update` or another mean (Like JQuery) to render small, incremental changes.

## Animations

You can specify an added and removed animation:  

```javascript
Render().into().addedAnimation(StringOrObject).removedAnimation(StringOrObject)
```

There are two flavours:  

You can set a className pointing to a CSS animation:

```css
.myCssAnimation {
   animation-name: xxx;
}
```

```javascript
Render().into().addedAnimation('myCssAnimation')
```

Or if you prefer to use a programmatic animation, can set an object as follow:  

```javascript
var addedAnimation = {
   start: function(node, endCallback) {$(node).hide().fadeIn(600, endCallback);},
   stop:  function(node) {$(node).stop(false, true);}
};

Render().into().addedAnimation(addedAnimation)
```
Note that JQuery effects are not great but will work fine in most simple scenarios.  
You can of course use any other tweening libraries to programmatically animate the nodes.


<a name="sales-pitch"></a>
# Sales pitch

**Templating/Rendering on the client**  
Not templating on the server has its uses, especially if you wish to interactively show, filter, 
sort or modify a known set of data without occuring a server round-trip.
Among client templating tasks, rendering a list of items is very common, yet it can be unnecessarily painful.

**Durendal is small and focused**  
Rendering a set of data to DOM nodes is certainly not new, many libraries do it (knockout, angular, d3, to name just a few)
But Durendal does just that, fast and easy, and you may want to use it when/if you don't use any of these libraries.

**Durendal is clean**  
The DOM remains absolutely clean, the binding occurs with succinct Javascript using a DSL.

**Durendal is flexible**  
You are not forced to shape your data in any particular way, since you specify how the data binds to the DOM
using the `added` and/or `each` callbacks.

**Durendal is fast**  
String based templating was considered superior a few years ago when browsers were very slow
at altering the DOM tree but faster with the innerHTML property. This is no longer the case and rendering a list of items using String based templating now only have disadvantages.

Furthermore, with a node based templating, the engine can easily
find out what changed between updates and just operate on those changes, instead of regenerating the full list everytime.


<a name="durendal"></a>
# Durendal?

* Duh, render all ?
* It will give you an edge  


