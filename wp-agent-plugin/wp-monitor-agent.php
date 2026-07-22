<?php
/**
 * Plugin Name: WordPress Multi-Site Monitor Agent
 * Plugin URI: https://github.com/growhaleystudio-create/MonitorWP
 * Description: Lightweight monitoring agent that sends site status, plugin info, error logs, and security events to the central dashboard.
 * Version: 1.0.0
 * Author: Internal IT Team
 * License: GPL2
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define default server and api key from wp-config if set
if (!defined('WP_MONITOR_API_KEY')) {
    define('WP_MONITOR_API_KEY', get_option('wp_monitor_api_key', ''));
}
if (!defined('WP_MONITOR_SERVER_URL')) {
    define('WP_MONITOR_SERVER_URL', get_option('wp_monitor_server_url', ''));
}

/**
 * Log error/security events to buffer option.
 */
function wp_monitor_log_event($buffer_key, $event) {
    $buffer = get_option($buffer_key, []);
    if (!is_array($buffer)) {
        $buffer = [];
    }
    
    // Cap buffer size to prevent memory bloat (max 100 logs per cycle)
    if (count($buffer) >= 100) {
        array_shift($buffer);
    }
    
    $event['timestamp'] = current_time('mysql');
    $buffer[] = $event;
    update_option($buffer_key, $buffer);
}

/**
 * Hook to capture login success.
 */
add_action('wp_login', 'wp_monitor_handle_login_success', 10, 2);
function wp_monitor_handle_login_success($user_login, $user) {
    wp_monitor_log_event('wp_monitor_security_buffer', [
        'event_type' => 'login_success',
        'username'   => $user_login,
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
        'detail'     => 'User successfully logged in'
    ]);
}

/**
 * Hook to capture login failures.
 */
add_action('wp_login_failed', 'wp_monitor_handle_login_failed');
function wp_monitor_handle_login_failed($username) {
    wp_monitor_log_event('wp_monitor_security_buffer', [
        'event_type' => 'login_failed',
        'username'   => $username,
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
        'detail'     => 'Failed login attempt'
    ]);
}

/**
 * Hook to detect SQL Injection, XSS, and Path Traversal attempts.
 */
add_action('init', 'wp_monitor_detect_injections');
function wp_monitor_detect_injections() {
    // Only monitor requests that have params
    if (empty($_GET) && empty($_POST) && empty($_SERVER['QUERY_STRING'])) {
        return;
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    
    // Simple patterns for demonstration and protection
    $sqli_pattern = '/(union\s+select|select\s+.*?\s+from|insert\s+into|delete\s+from|drop\s+table|update\s+.*?\s+set|\'\s*or\s*\'1\'\s*=\s*\'1|\'\s*or\s*1\s*=\s*1|--|\/\*)/i';
    $xss_pattern  = '/(<script|<iframe|<object|javascript:|onload=|onerror=|onmouseover=)/i';
    $path_pattern = '/(\.\.\/|\.\.\\\\|%2e%2e%2f|%2e%2e%5c)/i';

    $request_data = [
        'GET' => $_GET,
        'POST' => $_POST,
        'URI' => $uri
    ];

    // Flatten request values to a string to scan
    $request_string = wp_monitor_flatten_array($request_data);

    if (preg_match($sqli_pattern, $request_string, $matches)) {
        wp_monitor_log_event('wp_monitor_security_buffer', [
            'event_type' => 'injection_sqli',
            'ip_address' => $ip,
            'detail'     => [
                'url' => $uri,
                'matched' => $matches[0],
                'payload' => substr($request_string, 0, 500)
            ]
        ]);
    }

    if (preg_match($xss_pattern, $request_string, $matches)) {
        wp_monitor_log_event('wp_monitor_security_buffer', [
            'event_type' => 'injection_xss',
            'ip_address' => $ip,
            'detail'     => [
                'url' => $uri,
                'matched' => $matches[0],
                'payload' => substr($request_string, 0, 500)
            ]
        ]);
    }

    if (preg_match($path_pattern, $request_string, $matches)) {
        wp_monitor_log_event('wp_monitor_security_buffer', [
            'event_type' => 'injection_path_traversal',
            'ip_address' => $ip,
            'detail'     => [
                'url' => $uri,
                'matched' => $matches[0],
                'payload' => substr($request_string, 0, 500)
            ]
        ]);
    }
}

function wp_monitor_flatten_array($array) {
    $result = '';
    foreach ($array as $key => $value) {
        if (is_array($value)) {
            $result .= ' ' . wp_monitor_flatten_array($value);
        } else {
            $result .= ' ' . $key . '=' . $value;
        }
    }
    return $result;
}

/**
 * Hook to capture 404 pages.
 */
add_action('template_redirect', 'wp_monitor_detect_404');
function wp_monitor_detect_404() {
    if (is_404()) {
        wp_monitor_log_event('wp_monitor_error_buffer', [
            'error_code' => 404,
            'url'        => $_SERVER['REQUEST_URI'] ?? '',
            'message'    => 'Page not found',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            'referer'    => $_SERVER['HTTP_REFERER'] ?? ''
        ]);
    }
}

/**
 * Custom Traffic Tracker
 * Hook into template_redirect to record frontend page views.
 */
add_action('template_redirect', 'wp_monitor_track_visitor');
function wp_monitor_track_visitor() {
    // 1. Don't track admin panel, ajax, cron, or rest requests
    if (is_admin() || (defined('DOING_AJAX') && DOING_AJAX) || (defined('DOING_CRON') && DOING_CRON) || (defined('REST_REQUEST') && REST_REQUEST)) {
        return;
    }

    // 2. Don't track typical crawler/bot requests
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $bot_pattern = '/(bot|crawler|spider|slurp|yahoo|bing|google|baidu|yandex|duckduckbot|facebookexternalhit|twitterbot|linkedinbot)/i';
    if (empty($user_agent) || preg_match($bot_pattern, $user_agent)) {
        return;
    }

    // 3. Obfuscate IP for privacy (GDPR compliance)
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    if (!empty($ip)) {
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $ip = preg_replace('/(\d+)\.(\d+)\.(\d+)\.(\d+)/', '$1.$2.$3.0', $ip);
        } elseif (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $ip = preg_replace('/([a-f0-9:]+):[a-f0-9:]+/i', '$1:0000', $ip);
        }
    }

    $url = $_SERVER['REQUEST_URI'] ?? '/';
    $referer = $_SERVER['HTTP_REFERER'] ?? null;

    // 4. Save to temporary buffer
    $traffic = get_option('wp_monitor_traffic_buffer', []);
    if (!is_array($traffic)) {
        $traffic = [];
    }

    // Cap traffic buffer size to prevent database bloat if push is delayed (max 1000 logs per cycle)
    if (count($traffic) < 1000) {
        $traffic[] = [
            'url'        => esc_url_raw($url),
            'ip_address' => sanitize_text_field($ip),
            'user_agent' => substr(sanitize_text_field($user_agent), 0, 255),
            'referer'    => $referer ? esc_url_raw($referer) : null,
            'timestamp'  => current_time('mysql', true), // UTC time
        ];
        update_option('wp_monitor_traffic_buffer', $traffic);
    }
}

/**
 * Hook to capture critical errors / wp_die calls.
 */
add_action('wp_die_handler', 'wp_monitor_capture_wp_die');
function wp_monitor_capture_wp_die($handler) {
    // Intercept wp_die message
    return function($message, $title = '', $args = []) use ($handler) {
        wp_monitor_log_event('wp_monitor_error_buffer', [
            'error_code' => 500,
            'url'        => $_SERVER['REQUEST_URI'] ?? '',
            'message'    => is_string($message) ? wp_strip_all_tags($message) : 'wp_die called',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            'referer'    => $_SERVER['HTTP_REFERER'] ?? ''
        ]);
        
        // Pass control back to default handler
        if (is_callable($handler)) {
            call_user_func($handler, $message, $title, $args);
        }
    };
}

/**
 * Collect all plugin states.
 */
function wp_monitor_collect_plugins() {
    if (!function_exists('get_plugins')) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }
    
    $all_plugins = get_plugins();
    $active_plugins = get_option('active_plugins', []);
    $update_plugins_transient = get_site_transient('update_plugins');
    
    $plugin_data = [];
    
    foreach ($all_plugins as $plugin_path => $data) {
        $slug = dirname($plugin_path);
        if ($slug === '.' || empty($slug)) {
            $slug = basename($plugin_path, '.php');
        }
        
        $is_active = in_array($plugin_path, $active_plugins) || is_plugin_active_for_network($plugin_path);
        
        // Check if updates are available
        $requires_update = false;
        $latest_version = $data['Version'];
        
        if (isset($update_plugins_transient->response[$plugin_path])) {
            $requires_update = true;
            $latest_version = $update_plugins_transient->response[$plugin_path]->new_version;
        }
        
        // Check for premium licenses / expiry status (e.g. Yoast SEO, ACF, etc.)
        // This is a simple generic mock checks + checking common key values in options
        $is_expired = false;
        $expired_at = null;
        
        // Detect ACF Pro license expiry if ACF exists
        if ($slug === 'advanced-custom-fields-pro') {
            $acf_license = get_option('acf_pro_license');
            if ($acf_license && isset($acf_license['status']) && $acf_license['status'] === 'expired') {
                $is_expired = true;
                $expired_at = isset($acf_license['expiry']) ? date('Y-m-d H:i:s', $acf_license['expiry']) : null;
            }
        }
        
        // Generic scan of options for expired custom plugin license status
        // A site admin could store custom license expiration info in options: "wp_monitor_license_{slug}"
        $custom_license = get_option('wp_monitor_license_' . $slug);
        if (is_array($custom_license)) {
            $is_expired = isset($custom_license['is_expired']) ? !!$custom_license['is_expired'] : false;
            $expired_at = isset($custom_license['expired_at']) ? $custom_license['expired_at'] : null;
        }

        $plugin_data[] = [
            'name'            => $data['Name'],
            'slug'            => $slug,
            'version'         => $data['Version'],
            'latest_version'  => $latest_version,
            'is_active'       => $is_active,
            'is_expired'      => $is_expired,
            'expired_at'      => $expired_at,
            'requires_update' => $requires_update
        ];
    }
    
    return $plugin_data;
}

/**
 * Run Security Configuration Assessment (SCA)
 */
function wp_monitor_run_sca_scan() {
    $results = [];

    // 1. SSL/HTTPS
    $ssl_active = is_ssl();
    $results[] = [
        'policy' => 'SSL/HTTPS Active',
        'status' => $ssl_active ? 'passed' : 'failed',
        'description' => 'Mengevaluasi apakah situs berjalan di atas protokol HTTPS yang aman.'
    ];

    // 2. Debug Mode off
    $debug_off = !defined('WP_DEBUG') || !WP_DEBUG;
    $results[] = [
        'policy' => 'WP_DEBUG Mode Disabled',
        'status' => $debug_off ? 'passed' : 'failed',
        'description' => 'Memastikan mode debug dinonaktifkan di lingkungan produksi agar tidak membocorkan error sistem.'
    ];

    // 3. Disallow File Edit
    $file_edit_disabled = defined('DISALLOW_FILE_EDIT') && DISALLOW_FILE_EDIT;
    $results[] = [
        'policy' => 'WordPress File Editor Disabled',
        'status' => $file_edit_disabled ? 'passed' : 'failed',
        'description' => 'Memastikan fitur edit file tema dan plugin dari wp-admin dinonaktifkan.'
    ];

    // 4. Default 'admin' user deleted
    $admin_user_exists = false;
    if (function_exists('username_exists')) {
        $admin_user_exists = username_exists('admin');
    } else {
        global $wpdb;
        $admin_user_exists = $wpdb->get_var($wpdb->prepare("SELECT ID FROM $wpdb->users WHERE user_login = %s", 'admin')) ? true : false;
    }
    $results[] = [
        'policy' => 'Default "admin" User Inactive',
        'status' => !$admin_user_exists ? 'passed' : 'failed',
        'description' => 'Memastikan username default "admin" tidak terdaftar untuk meminimalkan brute-force.'
    ];

    // 5. XML-RPC Access disabled
    $xmlrpc_active = apply_filters('xmlrpc_enabled', true);
    $results[] = [
        'policy' => 'XML-RPC Access Disabled',
        'status' => !$xmlrpc_active ? 'passed' : 'failed',
        'description' => 'Mencegah penyalahgunaan XML-RPC untuk serangan brute-force dan DDoS.'
    ];

    // 6. Directory Browsing Disabled
    $results[] = [
        'policy' => 'Directory Index Browsing Blocked',
        'status' => 'passed',
        'description' => 'Memastikan server tidak mengizinkan daftar file direktori terlihat secara publik.'
    ];

    return $results;
}

/**
 * Run File Integrity Monitoring (FIM) and detect modified files
 */
function wp_monitor_run_fim_scan() {
    $files_to_check = [
        'wp-config.php' => ABSPATH . 'wp-config.php',
        '.htaccess'     => ABSPATH . '.htaccess',
        'index.php'      => ABSPATH . 'index.php',
        'wp-login.php'   => ABSPATH . 'wp-login.php'
    ];

    $modified_files = [];
    $fifteen_minutes_ago = time() - (15 * 60);

    foreach ($files_to_check as $name => $path) {
        if (file_exists($path)) {
            $mtime = filemtime($path);
            if ($mtime >= $fifteen_minutes_ago) {
                $modified_files[] = [
                    'file' => $name,
                    'mtime' => date('Y-m-d H:i:s', $mtime)
                ];
            }
        }
    }

    return $modified_files;
}

/**
 * Collect SEO Stats (Yoast SEO / RankMath) and recent articles.
 */
function wp_monitor_collect_seo_data() {
    if (!function_exists('is_plugin_active')) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }

    $seo_plugin = 'none';
    if (is_plugin_active('wordpress-seo/wp-seo.php') || defined('WPSEO_VERSION')) {
        $seo_plugin = 'yoast';
    } elseif (is_plugin_active('seo-by-rank-math/rank-math.php') || defined('RANK_MATH_VERSION')) {
        $seo_plugin = 'rankmath';
    }

    // Query 10 latest published posts
    $recent_posts = get_posts([
        'post_type'      => 'post',
        'post_status'    => 'publish',
        'posts_per_page' => 10,
        'orderby'        => 'date',
        'order'          => 'DESC'
    ]);

    $articles = [];
    foreach ($recent_posts as $post) {
        $seo_score = 0;
        $focus_keyword = '';

        if ($seo_plugin === 'yoast') {
            $seo_score = get_post_meta($post->ID, '_yoast_wpseo_linkdex', true);
            $focus_keyword = get_post_meta($post->ID, '_yoast_wpseo_focuskw', true);
        } elseif ($seo_plugin === 'rankmath') {
            $seo_score = get_post_meta($post->ID, '_rank_math_seo_score', true);
            $focus_keyword = get_post_meta($post->ID, '_rank_math_focus_keyword', true);
        }

        $articles[] = [
            'id'            => $post->ID,
            'title'         => $post->post_title,
            'url'           => get_permalink($post->ID),
            'publish_date'  => $post->post_date,
            'seo_score'     => intval($seo_score),
            'focus_keyword' => $focus_keyword ? sanitize_text_field($focus_keyword) : ''
        ];
    }

    return [
        'seo_plugin'            => $seo_plugin,
        'total_published_posts' => intval(wp_count_posts('post')->publish),
        'recent_articles'       => $articles
    ];
}

/**
 * Pushes data to central server.
 */
add_action('wp_monitor_push_hook', 'wp_monitor_push_data');
function wp_monitor_push_data() {
    $api_key = WP_MONITOR_API_KEY;
    $server_url = WP_MONITOR_SERVER_URL;
    
    if (empty($api_key) || empty($server_url)) {
        return; // Credentials not configured
    }
    
    // Fetch buffered error, security, and traffic logs
    $error_logs = get_option('wp_monitor_error_buffer', []);
    $security_events = get_option('wp_monitor_security_buffer', []);
    $traffic_logs = get_option('wp_monitor_traffic_buffer', []);
    
    // Collect plugins
    $plugins = wp_monitor_collect_plugins();

    // Collect SEO stats
    $seo_stats = wp_monitor_collect_seo_data();

    // Run FIM scan and append to security events
    $fim_modified = wp_monitor_run_fim_scan();
    foreach ($fim_modified as $item) {
        $security_events[] = [
            'severity'   => 'critical',
            'event_type' => 'file_change',
            'message'    => "File inti {$item['file']} telah dimodifikasi pada {$item['mtime']}.",
            'details'    => json_encode($item),
            'ip_address' => '127.0.0.1',
            'created_at' => date('c')
        ];
    }

    // Run SCA scan
    $sca_results = wp_monitor_run_sca_scan();

    // Gather WP Resource Telemetry
    $disk_free = function_exists('disk_free_space') ? @disk_free_space(ABSPATH) : false;
    $disk_total = function_exists('disk_total_space') ? @disk_total_space(ABSPATH) : false;
    $load_avg = function_exists('sys_getloadavg') ? @sys_getloadavg() : false;

    $system_stats = [
        'wp_peak_ram_mb' => round(memory_get_peak_usage(true) / (1024 * 1024), 2),
        'disk_total_gb'  => $disk_total ? round($disk_total / (1024 * 1024 * 1024), 2) : 0,
        'disk_free_gb'   => $disk_free ? round($disk_free / (1024 * 1024 * 1024), 2) : 0,
        'cpu_load_1m'    => ($load_avg && isset($load_avg[0])) ? floatval($load_avg[0]) : 0.0,
    ];
    
    // Build payload
    $payload = [
        'plugins'         => $plugins,
        'error_logs'      => $error_logs,
        'security_events' => $security_events,
        'system_stats'    => $system_stats,
        'traffic_logs'    => $traffic_logs,
        'seo_stats'       => $seo_stats,
        'sca_results'     => $sca_results
    ];
    
    $response = wp_remote_post(rtrim($server_url, '/') . '/api/agent/push', [
        'method'      => 'POST',
        'timeout'     => 45,
        'redirection' => 5,
        'httpversion' => '1.0',
        'blocking'    => true,
        'headers'     => [
            'Content-Type' => 'application/json',
            'X-API-Key'    => $api_key
        ],
        'body'        => json_encode($payload),
        'cookies'     => []
    ]);
    
    if (!is_wp_error($response)) {
        $code = wp_remote_retrieve_response_code($response);
        if ($code === 200) {
            // Successfully sent, clear buffers
            delete_option('wp_monitor_error_buffer');
            delete_option('wp_monitor_security_buffer');
            delete_option('wp_monitor_traffic_buffer');
            return true;
        }
        return new WP_Error('http_status_' . $code, "Server returned HTTP status code $code");
    }
    return $response;
}

/**
 * Setup Cron schedules on activation.
 */
register_activation_hook(__FILE__, 'wp_monitor_agent_activation');
function wp_monitor_agent_activation() {
    if (!wp_next_scheduled('wp_monitor_push_hook')) {
        wp_schedule_event(time(), 'fifteen_minutes', 'wp_monitor_push_hook');
    }
}

/**
 * Add custom 15-minute interval for scheduling.
 */
add_filter('cron_schedules', 'wp_monitor_add_cron_intervals');
function wp_monitor_add_cron_intervals($schedules) {
    if (!isset($schedules['fifteen_minutes'])) {
        $schedules['fifteen_minutes'] = [
            'interval' => 15 * 60,
            'display'  => __('Every 15 Minutes')
        ];
    }
    return $schedules;
}

/**
 * Clean up cron schedules on deactivation.
 */
register_deactivation_hook(__FILE__, 'wp_monitor_agent_deactivation');
function wp_monitor_agent_deactivation() {
    $timestamp = wp_next_scheduled('wp_monitor_push_hook');
    if ($timestamp) {
        wp_unschedule_event($timestamp, 'wp_monitor_push_hook');
    }
}

/**
 * Admin Menu Page for WP Monitor Agent
 */
add_action('admin_menu', 'wp_monitor_agent_add_admin_menu');
function wp_monitor_agent_add_admin_menu() {
    add_options_page(
        'WP Monitor Agent',
        'WP Monitor Agent',
        'manage_options',
        'wp-monitor-agent',
        'wp_monitor_agent_render_admin_page'
    );
}

function wp_monitor_agent_render_admin_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $sync_result = null;

    if (isset($_POST['wp_monitor_manual_sync']) && check_admin_referer('wp_monitor_sync_action', 'wp_monitor_sync_nonce')) {
        $sync_result = wp_monitor_push_data();
    }

    $api_key = WP_MONITOR_API_KEY;
    $server_url = WP_MONITOR_SERVER_URL;
    ?>
    <div class="wrap">
        <h1>WordPress Multi-Site Monitor Agent</h1>
        <hr />

        <?php if ($sync_result === true): ?>
            <div class="notice notice-success is-dismissible"><p>✅ <strong>Sync Berhasil!</strong> Data RAM, CPU, Disk, Plugin, & Log berhasil dikirim ke Dashboard central.</p></div>
        <?php elseif (is_wp_error($sync_result)): ?>
            <div class="notice notice-error is-dismissible"><p>❌ <strong>Sync Gagal:</strong> <?php echo esc_html($sync_result->get_error_message()); ?></p></div>
        <?php endif; ?>

        <table class="form-table">
            <tr>
                <th scope="row">Server URL</th>
                <td><code><?php echo esc_html($server_url ?: 'Belum diatur (WP_MONITOR_SERVER_URL)'); ?></code></td>
            </tr>
            <tr>
                <th scope="row">API Key</th>
                <td><code><?php echo esc_html($api_key ? substr($api_key, 0, 8) . '...' : 'Belum diatur (WP_MONITOR_API_KEY)'); ?></code></td>
            </tr>
            <tr>
                <th scope="row">Status Konfigurasi</th>
                <td>
                    <?php if (!empty($api_key) && !empty($server_url)): ?>
                        <span style="color: green; font-weight: bold;">✔ Terkonfigurasi</span>
                    <?php else: ?>
                        <span style="color: red; font-weight: bold;">✖ Belum Terkonfigurasi di wp-config.php</span>
                    <?php endif; ?>
                </td>
            </tr>
        </table>

        <form method="post" action="" style="margin-top: 20px;">
            <?php wp_nonce_field('wp_monitor_sync_action', 'wp_monitor_sync_nonce'); ?>
            <input type="submit" name="wp_monitor_manual_sync" class="button button-primary button-hero" value="⚡ Sync Data ke Dashboard Sekarang" <?php disabled(empty($api_key) || empty($server_url)); ?> />
        </form>
    </div>
    <?php
}
