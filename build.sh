#!/bin/bash
printf '<!doctype HTML>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DOI maker 1.0</title>
<style>
%b
</style>
</head>
<body id="app"></body>
<script>
%b
</script>
</html>' "$(cat src/styles.css)" "$(cat src/doimaker.js)" > app.html
