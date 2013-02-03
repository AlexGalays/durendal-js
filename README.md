# durendal-js
Simple node based list templating.

# Content
* [Code examples](#code-examples)
* [Sales pitch](#sales-pitch)

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
The DOM remains absolutely clean, the binding occurs in succint Javascript using a DSL.

**Durendal is flexible**  
You are not forced to shape your data in any particular way, since you specify how the data binds to the DOM
using the `added` and/or `each` callbacks.

**Durendal is fast**  
String based templating was considered superior a few years ago when browsers were very slow
at altering the DOM tree and but faster when with the innerHTML property. This is no longer the case and rendering a list of items using String based templating now only have disadvantages.

Furthermore, with a node based templating, the engine can easily
find out what changed between updates and just operate on those changes, instead of regenerating the full list everytime.