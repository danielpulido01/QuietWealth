# QuietWealth

# Auth

## Recomendaciones Rodri
OpenID connect no es necesario
Definir qué contenidos va a tener el JWT
Ver lo del HTTPS required
Client ID and Client Secret irían dentro del jwt
Cuánto de expiración al token
Cuánto al refresh
CSRF donde ponerlo, qué es?
Microsoft Entra o Google?
Dejar un solo lugar para storage de secrets
Qué vamos a hacer con esos casos que puede tardar hasta 5 segundos para auth? Progress bar o label para indicar al usuario
Soporta thousands concurrent pero cuántos necesita mi app? Ver cuántos esperamos y ver si están bajo el treshold estamos bien
El jwt probablemente no pase de 10 kb pero hay que definir lo que lleva
Cuantificar cuantas autenticaciones en el horario establecido
Quitar la hablada innecesaria
Aterrizar bien el workflow
Facade está bien
Adapter pattern está mal, probablemente quitar
DTO está bien
Async/Await ver qué clase y qué pasa con el usuario pero no es necesario
Proxy no hace falta si ya tenemos el facade
Queue innecesario
Y el resto generado por AI nos lo podemos volar
