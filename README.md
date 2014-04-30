JSS - Javascript Style Sheet
===

# Introdução
JSS é um framework javascript, que trabalha com CSS. Seguindo o modelo já bem sucedido de outros frameworks como SASS e LESS, a JSS traz também a alternativas para se dar um maior poder ao CSS.
## Diferencial
A grande diferença da JSS em comparação aos outros frameworks, é que ela não introduz uma nova linguagem, e nem precisa de um compilador para gerar as folhas de estilo, é todo o poder do javascript agora escrevendo CSS de maneira simples e prática. Além disso, JSS introduz o conceito de tratamento de imagens, onde é possível utilizar de diversas funções para tratar as cores de uma imagem. Isso é muito eficiente para bibliotecas de ícones, é possível modificar a cor dos ícones com apenas alguns métodos.
## O Básico
O objeto JSS principal, deve invocar a propriedade `init`, passando um objeto JSON que contenha toda a instrução:

```js
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
```
A propriedade `init` é que ficará responsável por fazer o parser do objeto JSON. Porem a maneira mais eficaz não é passar diretamente o objeto JSON no `init`, e sim criar uma objeto global com uma função de build e outra de style:
```js
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
```

Dessa maneira é possível criar propriedades no objeto CSS e chama-las no método style por meio do scopo local `this`.

## Seletores e propriedades aninhadas
Em JSS tanto os seletores quanto as propriedades podem ser aninhadas. Para seletores é usado o caractere `&` para aninha-los, já com as propriedades não é necessário:
```js
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
``` 
É importante entender como é feito o parser dos objetos em JSS, todo aninhamento, seja ele de seletor ou de propriedade, é feito por meio de concatenação de strings, dessa forma deve se entender onde e quando aplicar espaços ou não após o `&`. Veja o exemplo a seguir:

```js
'table':{
	'&tr':{
		...
	}
}
```
Observem que o seletor aninhado `&tr` não tem espaço após o `&`, isso geraria um seletor `tabletr{...}` que não representaria a real intenção do usuário. Para que a JSS gerasse um seletor corretamente, deve-se aplicar o espaço após o `&` dessa maneira `& tr` concatenaria com `table` dessa forma: `"table"+" tr"`, que dessa vez geraria o seletor esperado: `table tr{...}`.
Em propriedades, o uso do caracter `&` sozinho, faz com que o valor passado se aplique à propriedade a cima de forma única. No exemplo

```js
'border': {
	'&': '#ccc solid 1px'
}
```
Gera a saída: `border: #ccc solid 1px`.

```js
'border': {
	'radius': 5
}
```
Gera a saída: `border-radius: 5px`

Todo inteiro passado como valor é convertido para a unidade de pexel `px`, dessa maneira o exemplo a cima `'radius': 5` é convertido em `5px`, para unidades diferentes é necessario que se passe o valor por string: `'radius': '1em'`. em propriedades que não são relacionadas a medida, como é o caso da propriedade `z-index` o valor desse explicitamente ser passado por string, para que não seja convertido em `px`, dessa forma `'z-index': '2'` é convertido da maneira esperada.

## Funções

Em JSS, também é possivel importar funções para seu objeto de estilo principal por meio da propriedade `'$import': [this.func()]`, as funções devem retornar um objeto JSON de estilo ou um array de objetos.

```js
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
```	
Mais de uma função também pode ser chamada por `$import` pasando o array: `'$import': [this.func1(), this.func2, ...]`.

## Cores

A Subclasse `JSS.Color` traz diversas funções para manipulação de cores, para usar a classe JSS.Color é preciso inicia-la passando uma cor ao construtor, com qualquer formato de cor aceita pela CSS.

```js
new JSS.Color("red");
new JSS.Color("#f00");
new JSS.Color("#ff0000");
new JSS.Color("rgb(255,0,0)");
new JSS.Color("rgba(255,0,0,1)");
new JSS.Color("hsl(0,100,50)");
new JSS.Color("hsla(0,100,50,1)");
```	
Todos os formatos a cima resultam na cor vermelha. Após o objeto criado, é possível manipular todos os canais de cores, mesmo que não corresponda ao formato original.

```js
var vermelho = new JSS.Color("red");
vermelho.hue(20).green(30).saturation(20).alpha(.4).ligth(10).blue(20);
```	
Outras funções que de manipulação de cor também podem ser aplicadas

```js
var vermelho = new JSS.Color("red");
vermelho.desaturation(20).dark(20).multiply("blue").screen("#527").overlay("rgb(23,53,132)").mix(vermelho, 20);
```	
Também é possivel utilizar o método `getDistance(color)` da CLasse `JSS.Color`, que retornará um valor representado a qual diferente(distante) uma cor é da outra.

```js
var vermelho = new JSS.Color("red");
vermelho.getDistance("blue"); // Que resultará no valor 360.62445840513925;
vermelho.getDistance("red");  // Que resultará no valor 0;
```	
Também é possivel iniciar as cores pelos metodos staticos.

```js
var vermelho = JSS.Ligthen("red", 30);
// E depois se quiser ainda poderá continuar a mexer em seus canais.
vermelho.alpha(.3);
// Ou pela forma abreviada.
JSS.Ligthen("red", 30).alpha(.3);
```	
As funções estaticas de Cores são:

```js
JSS.Ligthen(color, percentLigth);
JSS.Darken(color, percentDark);
JSS.GetDistanceColor(color1, color2);
JSS.Mix(color1, color2, weight);
JSS.Multiply(color1, color2);
JSS.SCreen(color1, color2);
JSS.Overlay(color1, color2);
JSS.Defference(color1, color2);
JSS.Saturate(color, percent);
JSS.Desaturate(color, percent);
```	
## CSS Hack

Ao adicionar os caracteres `#-` ao inicio de uma propriedade ou valor, JSS interpretará esses caracteres como um CSS hack, como no exemplo a seguir:

```js
'.gradient': {
	'background': '#-linear-gradient(top, \
					'+JSS.Ligthen(this.black, 20).alpha(.8)+' 0%, \
					'+JSS.Ligthen(this.black, 50).alpha(0)+' 100%)',
}
```	
Saida:

```css
.gradient {
	background: linear-gradient(top, rgba(51,51,51,0.8) 0%, rgba(128,128,128,0) 100%);
	background: -o-linear-gradient(top, rgba(51,51,51,0.8) 0%, rgba(128,128,128,0) 100%);
	background: -ms-linear-gradient(top, rgba(51,51,51,0.8) 0%, rgba(128,128,128,0) 100%);
	background: -moz-linear-gradient(top, rgba(51,51,51,0.8) 0%, rgba(128,128,128,0) 100%);
	background: -khtml-linear-gradient(top, rgba(51,51,51,0.8) 0%, rgba(128,128,128,0) 100%);
	background: -webkit-linear-gradient(top, rgba(51,51,51,0.8) 0%, rgba(128,128,128,0) 100%);
}
```	
## Imagens

A JSS introduz o conceito de tratamento de imagens, com isso é possivel utilizar de todos os metodos de cores para se alterar as cores da imagem, isso é muito util para bibliotecas de ícones. Esta classe deve ser utilizad com cuidado e para imagens não muito grandes, pois compromete a performance de carregamento de su página.
Para tartar as imagens usamos a subcçasse `JSS.Image`, ao usar dessa classe o metodo `build` de seu Layout deve ser carregado após no `onload` de sua página.

Veja um exemplo completo de como criar uma biblioteca de ícones de duas cores diferentes apartir de um Sprite.

<figure_7.png>
> ![figure_7.png](https://github.com/jaykon-w/JSS/blob/master/Exemplos/lib_icon/figure_7.png?raw=true)


```js
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
			for(i = 0; i < h; i++){
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
			'$import': [this.makeIconOnColor('red', 255, 'red'), this.makeIconOnColor('green', 255, 'yellow'), this.iconCrop()],
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
```

