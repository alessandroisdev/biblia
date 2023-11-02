<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->get('testamentos', 'Home::testamentos');
$routes->get('livros', 'Home::livros');
$routes->get('livro/(:num)/capitulos', 'Home::capitulos/$1');
$routes->get('livro/(:num)/capitulo/(:num)/versiculos', 'Home::versiculos/$1/$2');
$routes->get('livro/(:num)/capitulo/(:num)/versiculo/(:num)', 'Home::versiculo/$1/$2/$3');