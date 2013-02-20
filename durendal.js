(function() {

/*
* Durendal v0.1
* Simple node based list templating.
*/
function Durendal(items) {
  var items = items,
      into,
      key,
      added,
      removed,
      each,
      addedAnimation,
      removedAnimation,
      container,
      template,
      templateName,
      playFirstAnimation = false,
      firstRender = true,

      defaultTemplates = {
        'select': 'option', 
        'ul': 'li', 
        'ol': 'li'
      };


  function render(newItems) {
    var data, bindings;

    items = newItems || items;
    
    findContainer();
    findTemplate();

    data = Render.data(items);
    bindings = bind(data);

    add(bindings.add);
    reAdd(bindings.reAdd);
    remove(bindings.remove);

    order(bindings.all);
    notify(bindings.all);

    firstRender = false;

    return render;
  }

  // The heart of the system: Bind a data Array to a collection of DOM nodes.
  // The algorithm is heavily inspired from d3.js.
  function bind(data) {
    var i,
        children = container.children,
        n = children.length,
        m = data.length,
        min = Math.min(m, n),
        removalPlaying = removedAnimation && removedAnimation.playing(),
        node,
        datum,
        keyToNode,
        keyValue,
        nodeKeys,
        // The new nodes that must be added this update
        add = [],
        // The nodes currently animating out but making a come back
        reAdd = [],
        // The nodes no longer matching any data
        remove = [],
        // The nodes that will remain on the stage this update
        all = [];

    // One to one DOM/Array binding
    if (key) {
      keyToNode = {};
      nodeKeys = [];

      for (i = -1; ++i < n;) {
        node = children[i];
        keyValue = node.__key__;
        keyToNode[keyValue] = node;
        nodeKeys.push(keyValue);
      }

      for (i = -1; ++i < m;) {
        datum = data[i];
        keyValue = key(datum);

        // There's already a node bound to this datum
        if (node = keyToNode[keyValue]) {
          all[i] = node;

          if (removalPlaying && removedAnimation.targets[keyValue])
            reAdd[i] = node;
        }
        // This datum is not bound to any node
        else {
          node = template.cloneNode(true);
          node.__data__ = datum;
          node.__key__ = keyValue;
          add[i] = all[i] = node;
        }

        delete keyToNode[keyValue];
      }

      for (i = -1; ++i < n;) {
        // This node is not bound to any data
        if (keyToNode[nodeKeys[i]]) {
          remove[i] = children[i];
          // This node will stay till the animation is over
          if (removedAnimation) all.splice(i, 0, children[i]);
        }
      }
    }
    // Bound by DOM/Array index
    else {
      for (i = -1; ++i < min;) {
        node = children[i];
        datum = data[i];

        if (removalPlaying && node && removedAnimation.targets[i]) {
          reAdd[i] = node;
        }
        else if (!node) {
          node = template.cloneNode(true);
          add[i] = node;
        }

        node.__data__ = datum;
        node.__key__ = i;
        all[i] = node;
      }

      // Data missing its nodes
      for (; i < m; ++i) {
        node = template.cloneNode(true);
        node.__data__ = data[i];
        node.__key__ = i;
        add[i] = all[i] = node;
      }

      // Nodes not bound to any data
      for (; i < n; ++i) {
        remove[i] = children[i];
        // This node will stay till the animation is over
        if (removedAnimation) all.splice(i, 0, children[i]);
      }
    }

    return {
      add: add,
      reAdd: reAdd,
      remove: remove,
      all: all
    };
  }

  function findContainer() {
    if (container) return;
    container = $(into)[0];
  }

  function findTemplate() {
    if (template) return;

    template = $(container).children('.template').removeClass('template')[0];

    if (template) {
      template.parentNode.removeChild(template);
      templateName = template.nodeName;
    }
    else {
      templateName = defaultTemplates[container.nodeName.toLowerCase()];
      template = document.createElement(templateName);
    }
  }

  function add(nodes) {
    var children = container.children,
        playAnimation = addedAnimation && (playFirstAnimation || !firstRender),
        node,
        i;

    for (i in nodes) {
      if (!nodes.hasOwnProperty(i)) continue;

      node = nodes[i];

      container.insertBefore(node, children[i]);
      if (added) added(node, node.__data__, i);
      if (playAnimation) addedAnimation.start(node);
    }
  }

  function reAdd(nodes) {
    var node;

    for (i in nodes) {
      if (!nodes.hasOwnProperty(i)) continue;

      node = nodes[i];

      removedAnimation.stop(node);
      if (addedAnimation) addedAnimation.start(node);
    }
  }

  function remove(nodes) {
    var children = container.children,
        node, 
        i;

    for (i in nodes) {
      if (!nodes.hasOwnProperty(i)) continue;

      node = nodes[i];

      if (removedAnimation && !removedAnimation.targets[node.__key__]) removedAnimation.start(node);
      else if (!removedAnimation) {
        container.removeChild(node);
        if (removed) removed(node, node.__data__, i);
      }
    }
  }

  function order(nodes) {
    var node, next, i;

    if (firstRender) return;

    for (i = nodes.length - 1, next = nodes[i]; --i >= 0;) {
      node = nodes[i];
      if (next && next !== node.nextSibling) container.insertBefore(node, next);
      next = node;
    }
  }

  function notify(nodes) {
    if (!each) return;

    for (var i in nodes) {
      if (!nodes.hasOwnProperty(i)) continue;

      each(nodes[i], nodes[i].__data__, i);
    }
  }

  /**
  * A Jquery selector used to find the container inside which
  * the templates will be repeated.
  * Only the first match is retained.
  */
  render.into = function(value) {
    if (!arguments.length) return into;
    into = value;
    return render;
  };

  /**
  * key is used to uniquely represent a datum and track its associated DOM node.
  * key comes as one of two flavours:
  * - A property name (assuming an Array of objects is used as data) representing the object uniquely.
  * - A function returning a String or Number that represents the object uniquely. The signature is function(data, index)
  * This property is only meant to be set once at setup time.
  */
  render.key = function(value) {
    if (!arguments.length) return key;
    key = isString(value) ? function(d) {return d[value]} : value;
    return render;
  };

  /**
  * Registers a callback that should be called everytime a node
  * is created and added to the DOM.
  */
  render.added = function(value, animation) {
    if (!arguments.length) return added;
    added = value;

    if (animation) 
      render.addedAnimation(animation);

    return render;
  };

  /**
  * Registers a callback that should be called everytime a node
  * is removed from the DOM. Note that such nodes are never reused.
  */
  render.removed = function(value) {
    if (!arguments.length) return removed;
    removed = value;
    return render;
  };

  /**
  * Registers a callback that should be called for each DOM node 
  * present after a rendering.
  */
  render.each = function(value) {
    if (!arguments.length) return each;
    each = value;
    return render;
  };

  /**
  * Whether the added animation should play for the first rendering.
  */
  render.playFirstAnimation = function(value) {
    if (!arguments.length) return playFirstAnimation;
    playFirstAnimation = value;
    return render;
  };

  /**
  * The animation to play when a node is added or re-added.
  * This can either be a CSS className representing a CSS animation or
  * in the case of programmatic animations, an object as follow:
  * {start: function(node, endCallback) {}, stop: function(node) {}}
  */
  render.addedAnimation = function(value) {
    if (!arguments.length) return (addedAnimation && addedAnimation.descriptor);

    if (addedAnimation && addedAnimation.descriptor === value) return render;

    if (addedAnimation) addedAnimation.stopAll();
    
    addedAnimation =
      (isString(value) && cssAnimationSupport.yes) ? CSSAnimation(value)
      : value ? ProgrammaticAnimation(value)
      : null;

    return render;
  };

  /**
  * The animation to play when a node is removed.
  * This can either be a CSS className representing a CSS animation or
  * in the case of programmatic animations, an object as follow:
  * {start: function(node, endCallback) {}, stop: function(node) {}}
  */
  render.removedAnimation = function(value) {
    if (!arguments.length) return (removedAnimation && removedAnimation.descriptor);

    if (removedAnimation && removedAnimation.descriptor === value) return render;

    if (removedAnimation) removedAnimation.stopAll();
    
    function removeChild(node) {container.removeChild(node);}

    removedAnimation =
      (isString(value) && cssAnimationSupport.yes) ? CSSAnimation(value, removeChild)
      : value ? ProgrammaticAnimation(value, removeChild)
      : null;

    return render;
  };

  /**
  * Performs a one-off rendering without any animation.
  */
  render.withoutAnimations = function(items) {
    var _added   = render.addedAnimation(),
        _removed = render.removedAnimation();

    render.addedAnimation(null);
    render.removedAnimation(null);

    render(items);

    render.addedAnimation(_added);
    render.removedAnimation(_removed);
  }

  /**
  * Returns the last rendered data as an Array.
  */
  render.data = function() {
    return Render.data(items);
  }

return render;

};

/**
* Converts the passed structure to an Array.
*/
Durendal.data = function(from) {
  var data = asFunction(from)();
  return data
    ? isArray(data) ? data : data.items
    : [];
}

/**
* Returns the data currently bound to the passed node.
*/
Durendal.dataFor = function(node) {
  while (!node.__data__ && node.parentNode) 
    node = node.parentNode;
  
  return node.__data__;
}


function isArray(instance) {
   return Object.prototype.toString.call(instance) == '[object Array]';
}

function isString(instance) {
   return Object.prototype.toString.call(instance) == '[object String]';
}

function asFunction(v) {
  return typeof v === "function" ? v : function() {return v;};
}

function Animation(stop, endCallback) {
  var targetCount = 0,
      targets     = {},
      onAllEnded;

  function started(node) {
    targetCount++;
    targets[node.__key__] = node;
  }

  function stopped(node, withCallback) {
    targetCount--;
    delete targets[node.__key__];

    if (onAllEnded && !targetCount) onAllEnded();
    if (endCallback && withCallback) endCallback(node);
  }

  function stopAll() {
    for (var key in targets) {
      stop(targets[key], true);
    }
  }

  function playing() {return targetCount > 0;}

  return {
    targets: targets,
    playing: playing,
    started: started,
    stopped: stopped,
    stopAll: stopAll
  };
}

function ProgrammaticAnimation(descriptor, endCallback) {
  var animation = Animation(stop, endCallback),
      endHandlerEnabled = true;

  function start(node) {
    animation.started(node);
    descriptor.start(node, endHandler);
  }

  function stop(node, withCallback) {
    // An external effect library might call the end handler
    // even if the effect was stopped programmatically; This guard
    // prevents us from stopping the same node twice.
    endHandlerEnabled = false;
    descriptor.stop(node);
    endHandlerEnabled = true;

    animation.stopped(node, withCallback);
  }

  function endHandler(node) {
    if (!endHandlerEnabled) return;

    node = node || this;
    animation.stopped(node, true);
  }

  return {
    descriptor: descriptor,
    start: start,
    stop: stop,
    targets: animation.targets,
    playing: animation.playing,
    stopAll: animation.stopAll
  };
}

function CSSAnimation(name, endCallback) {
  var animation = Animation(stop, endCallback);

  function start(node) {
    animation.started(node);

    node.addEventListener(cssAnimationSupport.endEvent, endHandler);
    $(node).addClass(name);
  }

  function stop(node, withCallback) {
    node.removeEventListener(cssAnimationSupport.endEvent, endHandler);
    $(node).removeClass(name);

    animation.stopped(node, withCallback);
  }

  function endHandler(event) {
    event.stopPropagation();
    stop(event.currentTarget, true);
  }

  return {
    descriptor: name,
    start: start,
    stop: stop,
    targets: animation.targets,
    playing: animation.playing,
    stopAll: animation.stopAll
  };
}


var cssAnimationSupport = (function() {
  var dummy         = document.createElement("div"),
      stylePrefixes = ['Webkit', 'Moz', 'O'];
      
  if (dummy.style.animationName !== undefined)
    return {yes: true, endEvent: 'animationend'};
 
  for (var i = 0; i < stylePrefixes.length; i++) {
    if (dummy.style[stylePrefixes[i] + 'AnimationName'] !== undefined)
      return {yes: true, endEvent: (stylePrefixes[i].toLowerCase() + 'AnimationEnd')};
  }

  return {yes: false};
})();


window.Render = Durendal;

})();