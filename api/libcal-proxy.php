<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request data
$input = json_decode(file_get_contents('php://input'), true);
$payload = $input['payload'] ?? null;

// Default values (Olin 251)
$lid = '8176';
$gid = '14568'; 
$eid = '107918';

// Override with payload if provided
if (is_array($payload) && count($payload) >= 3) {
    list($lid, $gid, $eid) = $payload;
}

// Current date
$startDate = date('Y-m-d');
$endDate = date('Y-m-d', strtotime('+1 day'));

// Parameters for LibCal API
$postData = http_build_query([
    'lid' => $lid,
    'gid' => $gid,
    'eid' => $eid,
    'seat' => '0',
    'seatId' => '0',
    'zone' => '0',
    'start' => $startDate,
    'end' => $endDate,
    'pageIndex' => '0',
    'pageSize' => '18'
]);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => [
            'Content-Type: application/x-www-form-urlencoded',
            'Accept: application/json, text/javascript, */*; q=0.01',
            'User-Agent: Mozilla/5.0 (compatible; RoomBookingSystem/1.0)',
            'Referer: https://libcal.wesleyan.edu/',
            'X-Requested-With: XMLHttpRequest'
        ],
        'content' => $postData
    ]
]);

try {
    $response = file_get_contents('https://libcal.wesleyan.edu/spaces/availability/grid', false, $context);
    
    if ($response === false) {
        throw new Exception('Failed to fetch data from LibCal');
    }
    
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON response from LibCal');
    }
    
    // Add debug information
    $result = [
        'success' => true,
        'data' => $data,
        'debug' => [
            'requestParams' => ['lid' => $lid, 'gid' => $gid, 'eid' => $eid],
            'dates' => ['start' => $startDate, 'end' => $endDate],
            'timestamp' => date('c'),
            'responseSize' => strlen($response)
        ]
    ];
    
    echo json_encode($result);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => [
            'requestParams' => ['lid' => $lid, 'gid' => $gid, 'eid' => $eid],
            'dates' => ['start' => $startDate, 'end' => $endDate],
            'timestamp' => date('c')
        ]
    ]);
}
?>
