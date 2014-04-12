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
É importante entender como é feito o parser dos objetos em JSS, todo aninhamento, seja ele de seletor ou de propriedade, é feito por meio de concatenação de strings, dessa forma deve se entender onde e quando aplicar espaços ou não após o `&`. Veja o exemplo a seguir:

<!-- language: lang-js -->
	'table':{
		'&tr':{
			...
		}
	}
Observem que o seletor aninhado `&tr` não tem espaço após o `&`, isso geraria um seletor `tabletr{...}` que não representaria a real intenção do usuário. Para que a JSS gerasse um seletor corretamente, deve-se aplicar o espaço após o `&` dessa maneira `& tr` concatenaria com `table` dessa forma: `"table"+" tr"`, que dessa vez geraria o seletor esperado: `table tr{...}`.
Em propriedades, o uso do caracter `&` sozinho, faz com que o valor passado se aplique à propriedade a cima de forma única. No exemplo

<!-- language: lang-js -->
	'border': {
		'&': '#ccc solid 1px'
	}
Gera a saída: `border: #ccc solid 1px`.

<!-- language: lang-js -->
	'border': {
		'radius': 5
	}
Gera a saída: `border-radius: 5px`

Todo inteiro passado como valor é convertido para a unidade de pexel `px`, dessa maneira o exemplo a cima `'radius': 5` é convertido em `5px`, para unidades diferentes é necessario que se passe o valor por string: `'radius': '1em'`. em propriedades que não são relacionadas a medida, como é o caso da propriedade `z-index` o valor desse explicitamente ser passado por string, para que não seja convertido em `px`, dessa forma `'z-index': '2'` é convertido da maneira esperada.

## Funções

Em JSS, também é possivel importar funções para seu objeto de estilo principal por meio da propriedade `'$import': [this.func()]`, as funções devem retornar um objeto JSON de estilo ou um array de objetos.

<!-- language: lang-js -->
	bordaJanela: function(rounded, shadow){
		var estilo = [];
		
		if(rounded === true){
			estilo.push({'border-radius': 5});
		}
		if(shadow === true){
			estilo.push({'box-shadow': '#000 3px 3px 5px'});
		}
		
		return estilo;
		
	},
	
	style: function(){
		return {
			'.window':{
				'$import': [this.bordaJanela(true, true)]
			}
		}
	}
	
Mais de uma função também pode ser chamada por `$import` pasando o array: `'$import': [this.func1(), this.func2, ...]`.
