(function(MM){

    MM.TouchHandler = function() { }

    MM.TouchHandler.prototype = {

        init: function(map) {
            this.map = map;
            MM.addEvent(map.parent, 'touchstart', this.getDoubleTap());
            MM.addEvent(map.parent, 'touchstart', this.getTouchStart());
            MM.addEvent(map.parent, 'gesturestart', this.getGestureStart());            
        },

        gestureStart: null,
        gestureChange: null,
        gestureCenter: null,
        gestureEnd: null,
        
        startCenter: null,
        startScale: undefined,
        startZoom: undefined,

        getGestureStart: function() {
            if (!this.gestureStart) {
                var theHandler = this;
                this.gestureStart = function(e) {
                    MM.addEvent(theHandler.map.parent, 'touchmove', theHandler.getGestureCenter());
                    MM.addEvent(theHandler.map.parent, 'gesturechange', theHandler.getGestureChange());            
                    MM.addEvent(theHandler.map.parent, 'gestureend', theHandler.getGestureEnd());            
                    theHandler.startScale = e.scale;
                    theHandler.startZoom = theHandler.map.getZoom();
                    return MM.cancelEvent(e);
                }
            }
            return this.gestureStart;
        },
        
        getGestureCenter: function() {
            if (!this.gestureCenter) {
                var theHandler = this;
                this.gestureCenter = function(e) {
                    if (e.touches.length == 2) {
                        var centerX = (e.touches[0].pageX + e.touches[1].pageX) / 2.0;
                        var centerY = (e.touches[0].pageY + e.touches[1].pageY) / 2.0;
                        theHandler.startCenter = new MM.Point(centerX, centerY);
                    }
                }
            }
            return this.gestureCenter;
        },

        getGestureChange: function() {
            if (!this.gestureChange) {
                var theHandler = this;
                this.gestureChange = function(e) {
                    if (theHandler.startScale !== undefined && theHandler.startZoom !== undefined) {
                        var scaleFactor = e.scale / theHandler.startScale;
                        var zoomFactor = Math.log(scaleFactor) / Math.log(2);
                        zoomFactor = Math.round(zoomFactor);
                        if (zoomFactor != 0 && theHandler.startCenter) {
                            var currentZoom = theHandler.map.getZoom();
                            var targetZoom = theHandler.startZoom + zoomFactor;
                            theHandler.map.zoomByAbout(targetZoom - currentZoom, theHandler.startCenter);
                        }
                    }
                    return MM.cancelEvent(e);
                }
            }
            return this.gestureChange;
        },
        
        getGestureEnd: function() {
            if (!this.gestureEnd) {
                var theHandler = this;
                this.gestureEnd = function(e) {
                    MM.removeEvent(theHandler.map.parent, 'gesturechange', theHandler.getGestureChange());            
                    MM.removeEvent(theHandler.map.parent, 'touchmove', theHandler.getGestureCenter());
                    MM.removeEvent(theHandler.map.parent, 'gestureend', theHandler.getGestureEnd());            
                    theHandler.startCenter = null;
                    theHandler.startScale = undefined;
                    theHandler.startZoom = undefined;
                    return MM.cancelEvent(e);
                }
            }
            return this.gestureEnd;
        },
        
        touchStartHandler: null,
    
        getTouchStart: function() {
            if (!this.touchStartHandler) {
                var theHandler = this;
                this.touchStartHandler = function(e) {
                    if (e.touches.length == 1) { 
                        MM.addEvent(document, 'touchcancel', theHandler.getTouchEnd());
                        MM.addEvent(document, 'touchend', theHandler.getTouchEnd());
                        MM.addEvent(document, 'touchmove', theHandler.getTouchMove());
                        theHandler.prevTouch = new MM.Point(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
                    } 
                    return MM.cancelEvent(e);
                };
            }
            return this.touchStartHandler;
        },
        
        touchMoveHandler: null,
        
        getTouchMove: function() {
            if (!this.touchMoveHandler) {
                var theHandler = this;
                this.touchMoveHandler = function(e) {
                    if (theHandler.prevTouch && e.touches.length == 1) {
                        theHandler.map.panBy(e.touches[0].pageX - theHandler.prevTouch.x, 
                                             e.touches[0].pageY - theHandler.prevTouch.y);
                        theHandler.prevTouch.x = e.touches[0].pageX;
                        theHandler.prevTouch.y = e.touches[0].pageY;
                    }
                    return MM.cancelEvent(e);
                };
            }
            return this.touchMoveHandler;
        },
    
        touchEndHandler: null,
    
        getTouchEnd: function() {
            if (!this.touchEndHandler) {
                var theHandler = this;
                this.touchEndHandler = function(e) {
                    if (theHandler.prevTouch && e.touches.length == 0) {
                        MM.removeEvent(document, 'touchend', theHandler.getTouchEnd());
                        MM.removeEvent(document, 'touchcancel', theHandler.getTouchEnd());
                        MM.removeEvent(document, 'touchmove', theHandler.getTouchMove());
                        theHandler.prevTouch = null;
                    }
                    return MM.cancelEvent(e);
                };
            }
            return this.touchEndHandler;
        },
        
        doubleTapHandler: null,
    
        getDoubleTap: function() {
            if (!this.doubleTapHandler) {
                var theHandler = this,
                    prevPoint = null,
                    prevTime = 0;
                function distsq(p1,p2) {
                    var dx = p2.x-p1.x,
                        dy = p2.y-p1.y;
                    return dx*dx + dy*dy;
                }
                this.doubleTapHandler = function(e) {
                    if (e.touches.length == 1) {
                        var point = new MM.Point(e.touches[0].pageX, e.touches[0].pageY);
                        if (prevPoint) {
                            var dist = distsq(prevPoint, point),
                                dt   = new Date().getTime() - prevTime;
                            // TODO: find out what the "best" values for double tap tolerance are...
                            if (dist < 100.0 && dt < 400) {
                                theHandler.map.zoomByAbout(1, point);    
                            }
                        }
                        prevPoint = point;
                        prevTime = new Date().getTime(); 
                    }
                };
            }
            return this.doubleTapHandler;
        }
    
    };

})(com.modestmaps);