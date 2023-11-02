<?php

namespace App\Helpers;

class Arrays
{
    public static function simplificar($inputArray, $argument): array
    {
        $simplifiedArray = array();

        foreach ($inputArray as $item) {
            if (
                key_exists($argument, $item) &&
                !in_array($item[$argument], $simplifiedArray)
            ) {
                $simplifiedArray[] = $item[$argument];
            }
        }

        return $simplifiedArray;
    }
}