JSS - Javascript Style Sheet
===

# Introdução
***
JSS é um framework javascript, que trabalha com CSS. Seguindo o modelo já bem sucedido de outros frameworks como SASS e LESS, a JSS traz também a alternativas para se dar um maior poder ao CSS.
## Diferencial
A grande diferença da JSS em comparação aos outros frameworks, é que ela não introduz uma nova linguagem, e nem precisa de um compilador para gerar as folhas de estilo, é todo o poder do javascript agora escrevendo CSS de maneira simples e prática. Além disso, JSS introduz o conceito de tratamento de imagens, onde é possível utilizar de diversas funções para tratar as cores de uma imagem. Isso é muito eficiente para bibliotecas de ícones, é possível modificar a cor dos ícones com apenas alguns métodos.
***
## O Básico
O objeto JSS principal, deve invocar a propriedade `init`, passando um objeto JSON que contenha toda a instrução:

<!-- language: lang-js -->
	var build = function(){
		return new JSS({
	    		init: {
	      			'#divID':{
	        			'border': {
			  				'&': '#ddd solid 1px',
			  				'top':{
			    					'left':{
			      						'radius': 35
			    					}
			  				},
				  			'bottom':{
				    				'left':{
				      					'radius': 35
				    				}
				  			}
					}
	      		}
	    	}
	  	});
	}

A propriedade `init` é que ficará responsável por fazer o parser do objeto JSON. Porem a maneira mais eficaz não é passar diretamente o objeto JSON no `init`, e sim criar uma objeto global com uma função de build e outra de style:

	var CSS = {
		
		black: '#000',
		white: '#fff',
		
		style: function(){
			
			
			return {
				'.super-head': {
					'background': '#-linear-gradient(top, \
									'+JSS.Ligthen(this.black, 20).alpha(.8)+' 0%, \
									'+JSS.Ligthen(this.black, 50).alpha(0)+' 100%)',
					'height': 200,
					'width': '100%',
					'overflow': 'hidden',
					'& > header':{
						'& > img':{
							'#-animation': {
								'&': 'showlogo 600ms ease-in',
							},
							'position': 'absolute',
							'left': 'calc(100% - 254px)',
							'z-index': '100',
							'top': 10,
							'background': this.white,
							'padding-left': 10,
							'border': {
								'&': '#ddd solid 1px',
								'top':{
									'left':{
										'radius': 35
									}
								},
								'bottom':{
									'left':{
										'radius': 35
									}
								}
							},
							'box-shadow': '#333 3px 5px 3px',
						}
					}
				}
			}
		},
		
		build: function(){
			return new JSS({
				init: this.style()
			})
		}
	}
  	CSS.build();

Dessa maneira é possível criar propriedades no objeto CSS e chama-las no método style por meio do scopo local `this`.

## Seletores e propriedades aninhadas
Em JSS tanto os seletores quanto as propriedades podem ser aninhadas. Para seletores é usado o caractere `&` para aninha-los, já com as propriedades não é necessário:
<!-- language: lang-js -->
    'table':{
		'& tr':{
			'padding':{
				'top': 5,
				'bottom': 5
			},
			'& td':{
				'&(1)':{	
					'font-weight': 'bold'
				}
			}
		},
		'border': {
			'&': '#ccc solid 1px',
			'radius': 5
		}
	}
	/*
	 * Saida:
	 * table {
	 * 	border: '#ccc solid 1px';
	 * 	border-radius: 5px;
	 * }
	 * 
	 * table tr {
	 * 	padding-top: 5px;
	 * 	padding-bottom: 5px;
	 * }
	 * 
	 * table tr td:nth-child(1){
	 * 	font-weight: bold;
	 * }
	 */

