# durendal-js
Simple node based list templating.

# Content
* [Code examples](#code-examples)

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