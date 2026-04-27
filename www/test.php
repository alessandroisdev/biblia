<?php
$ch = curl_init('https://www.letras.mus.br/aline-barros/ressuscita-me/');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
$res = curl_exec($ch);

if (preg_match('/class="lyric-original">(.*?)<\/div>/s', $res, $matches)) {
    $html = $matches[1];
    // Replace <p> tags with newlines
    $html = preg_replace('/<p(.*?)>/', '', $html);
    $html = str_replace('</p>', "\n\n", $html);
    $html = str_replace('<br/>', "\n", $html);
    $html = str_replace('<br>', "\n", $html);
    
    $text = strip_tags($html);
    echo trim(substr($text, 0, 300)) . "\n";
} else {
    echo "Not found.\n";
}
