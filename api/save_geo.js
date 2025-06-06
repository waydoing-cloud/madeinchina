const fs = require('fs');
const path = require('path');

function getDate(name) {
    const now = new Date();
    return `${name}-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end('Only POST allowed');
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', () => {
        try {
            const { geo } = JSON.parse(body);
            const folderName = getDate('GEO');
            const dataDir = path.join(__dirname, '..', 'data', folderName);

            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            fs.writeFileSync(path.join(dataDir, 'geoInfo.json'), JSON.stringify(geo, null, 2), 'utf-8');

            res.statusCode = 200;
            res.end('OK');
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end('Server error');
        }
    });
};
