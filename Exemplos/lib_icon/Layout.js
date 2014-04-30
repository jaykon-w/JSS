var CSS = {

		icones: [
			new JSS.Image('figure_7.png')
		],
	
		makeIconOnColor: function(func, value, colorName){
			var iconClass = {};
			
			var Icons = this.icones[0];
			
			iconClass['&[class~=icon-'+colorName+']'] = {
				'background': 'url("'+Icons[func](value)+'")'
			}
			
			return iconClass;
		},
		
		iconCrop: function(){
			var span = 5,
				v = 5,
				h = 20,
				size = 24,
				icons = {},
				inc = 0;
			
			for(a = 0; a <= v; a++){	
				for(i = 0; i <= h - span; i++){
					icons['&.icon-'+inc] = {
						'background-position': {
							x: ~((i*size)+span),
							y: ~((a*size)+span)
						},
						width: size,
						height: size,
						display: 'block'
					};
					
					inc++;
				}
			}
			
			return icons;
		},
		
		style: function(){
			return {
				'body':{
					margin: 0
				},
				'':{
					'$import': [this.makeIconOnColor('red', 255, 'red'), this.makeIconOnColor('green', 255, 'yellow'), this.iconCrop()],
				},
				'.left':{
					float: 'left'
				},
				'.clear':{
					clear: 'both'
				}
			}
		},
		
		build: function(){
			return new JSS({
				init: this.style()
			})
		}
	
};
