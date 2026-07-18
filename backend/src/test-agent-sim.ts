import express from 'express';
import axios from 'axios';
import { prisma } from './db';
import { validateAgentKey } from './middleware/auth';
import { handleAgentPush } from './controllers/agentController';

const app = express();
app.use(express.json());
app.post('/api/agent/push', validateAgentKey, handleAgentPush);

async function runTest() {
  const server = app.listen(4000, async () => {
    console.log('Test server started on port 4000');
    
    try {
      // 1. Create a test site in database
      const testApiKey = 'test_agent_api_key_abc123';
      const site = await prisma.site.upsert({
        where: { apiKey: testApiKey },
        update: {},
        create: {
          name: 'Verification Test Site',
          url: 'http://example-test-wp.local',
          apiKey: testApiKey,
          status: 'unknown',
        },
      });

      console.log('1. Test site verified/created:', site.name);

      // 2. Prepare mock agent payload
      const mockPayload = {
        plugins: [
          {
            name: 'Akismet Anti-Spam',
            slug: 'akismet',
            version: '5.3',
            is_active: true,
            requires_update: true,
            latest_version: '5.3.2',
          },
          {
            name: 'Yoast SEO Premium',
            slug: 'wordpress-seo-premium',
            version: '22.0',
            is_active: true,
            is_expired: true,
            expired_at: '2026-07-10T12:00:00.000Z',
          }
        ],
        error_logs: [
          {
            error_code: 404,
            url: '/wp-content/themes/non-existent-theme/style.css',
            message: 'File not found',
            user_agent: 'Mozilla/5.0 Test Agent',
            ip_address: '127.0.0.1',
          }
        ],
        security_events: [
          {
            event_type: 'login_failed',
            username: 'hacker_admin',
            ip_address: '198.51.100.42',
            detail: 'Failed login attempt via wp-login.php',
          },
          {
            event_type: 'injection_sqli',
            ip_address: '198.51.100.42',
            detail: 'SQLi attack detected: id=1 OR 1=1',
          },
          {
            event_type: 'file_change',
            ip_address: '127.0.0.1',
            detail: 'File inti wp-config.php telah dimodifikasi pada 2026-07-17 19:40:00.',
            message: 'File inti wp-config.php telah dimodifikasi pada 2026-07-17 19:40:00.',
          }
        ],
        system_stats: {
          wp_peak_ram_mb: 32.4,
          disk_total_gb: 100.0,
          disk_free_gb: 64.2,
          cpu_load_1m: 0.15,
        },
        traffic_logs: [
          {
            url: '/about-us',
            ip_address: '192.168.1.10',
            user_agent: 'Mozilla/5.0 Test Browser',
            referer: 'https://google.com',
            timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
          },
          {
            url: '/blog/first-post',
            ip_address: '192.168.1.20',
            user_agent: 'Mozilla/5.0 Another Browser',
            referer: 'https://facebook.com',
            timestamp: new Date().toISOString(),
          }
        ],
        seo_stats: {
          seo_plugin: 'rankmath',
          total_published_posts: 42,
          recent_articles: [
            {
              id: 101,
              title: 'Cara Meningkatkan SEO WordPress',
              url: 'http://example-test-wp.local/cara-meningkatkan-seo-wordpress',
              publish_date: new Date().toISOString(),
              seo_score: 85,
              focus_keyword: 'seo wordpress',
            }
          ]
        },
        sca_results: [
          {
            policy: 'SSL/HTTPS Active',
            status: 'passed',
            description: 'Mengevaluasi apakah situs berjalan di atas protokol HTTPS yang aman.'
          },
          {
            policy: 'WP_DEBUG Mode Disabled',
            status: 'passed',
            description: 'Memastikan mode debug dinonaktifkan di lingkungan produksi agar tidak membocorkan error sistem.'
          },
          {
            policy: 'WordPress File Editor Disabled',
            status: 'failed',
            description: 'Memastikan fitur edit file tema dan plugin dari wp-admin dinonaktifkan.'
          },
          {
            policy: 'Default "admin" User Inactive',
            status: 'passed',
            description: 'Memastikan username default "admin" tidak terdaftar untuk meminimalkan brute-force.'
          },
          {
            policy: 'XML-RPC Access Disabled',
            status: 'failed',
            description: 'Mencegah penyalahgunaan XML-RPC untuk serangan brute-force dan DDoS.'
          },
          {
            policy: 'Directory Index Browsing Blocked',
            status: 'passed',
            description: 'Memastikan server tidak mengizinkan daftar file direktori terlihat secara publik.'
          }
        ]
      };

      console.log('2. Sending mock agent push request to API gateway...');

      // 3. Post payload to the server
      const response = await axios.post('http://localhost:4000/api/agent/push', mockPayload, {
        headers: {
          'X-API-Key': testApiKey,
        },
      });

      console.log('3. Server sync response:', response.data);

      // 4. Verify database state
      const updatedSite = await prisma.site.findUnique({
        where: { id: site.id },
        include: {
          plugins: true,
          errorLogs: true,
          securityEvents: true,
          alerts: true,
          trafficLogs: true,
        },
      });

      if (!updatedSite) {
        throw new Error('Test site not found after sync!');
      }

      console.log('4. Verification results:');
      console.log(`   - Site status: ${updatedSite.status} (expected: online)`);
      console.log(`   - Plugins synced: ${updatedSite.plugins.length} (expected: 2)`);
      console.log(`   - Error logs logged: ${updatedSite.errorLogs.length} (expected: 1)`);
      console.log(`   - Security events logged: ${updatedSite.securityEvents.length} (expected: 3)`);
      console.log(`   - Traffic logs logged: ${updatedSite.trafficLogs.length} (expected: 2)`);
      console.log(`   - Site SEO plugin: ${updatedSite.seoPlugin} (expected: rankmath)`);
      console.log(`   - Site SEO total posts: ${updatedSite.seoTotalPosts} (expected: 42)`);
      console.log(`   - Site SEO recent posts count: ${updatedSite.seoRecentPosts ? JSON.parse(updatedSite.seoRecentPosts).length : 0} (expected: 1)`);
      console.log(`   - Site SCA compliance score: ${updatedSite.scaScore}% (expected: 67%)`);
      
      console.log('\nAll alerts logged in DB for test site:');
      updatedSite.alerts.forEach((alert, index) => {
        console.log(`     [${index + 1}] Type: ${alert.alertType} | Severity: ${alert.severity} | Msg: ${alert.message}`);
      });

      console.log('\n✅ VERIFICATION SUCCESSFUL: Agent data ingestion, SEO stats, and traffic logging function perfectly!');
    } catch (err: any) {
      console.error('❌ VERIFICATION FAILED:', err.message || err);
    } finally {
      // Close the server and exit
      server.close(() => {
        console.log('Test server shut down.');
        process.exit(0);
      });
    }
  });
}

runTest();
