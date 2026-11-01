import fs from 'fs'
import path from 'path'

const DB_FILE = path.resolve(process.cwd(), 'data', 'local_db.json')

const DEFAULT_DB = {
  users: [
    {
      id: 'user-admin',
      username: 'admin',
      password: 'admin123',
      name: 'Dr. Yatish',
      role: 'admin_supervisor',
      designation: 'Chief Medical Administrator & Super Admin',
      phone: '+91 98765 43210'
    },
    {
      id: 'user-dr-yatish',
      username: 'dr-yatish',
      password: 'Yatish',
      name: 'yatish',
      role: 'pharmacist',
      designation: 'Dispensary Pharmacist',
      phone: '+91 98765 00000'
    }
  ],
  medicines: [],
  batches: [],
  patients: [],
  suppliers: [],
  requisitions: [],
  sales: [],
  discountPolicy: {
    discount_percent: 0,
    authorized_by: 'None',
    reason: 'Standard Bill Rate (No Discount Set)'
  }
}

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
      return {
        ...DEFAULT_DB,
        ...data,
        users: Array.isArray(data.users) && data.users.length > 0 ? data.users : DEFAULT_DB.users
      }
    }
  } catch (err) {
    console.warn('[LocalDb] Error reading local_db.json, using fallback:', err.message)
  }
  return { ...DEFAULT_DB }
}

function writeDb(data) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true })
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('[LocalDb] Error writing to local_db.json:', err.message)
  }
}

function getBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'))
      } catch (e) {
        resolve({})
      }
    })
  })
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

export function localDbPlugin() {
  return {
    name: 'rvs-local-shared-db',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next()
        }

        const url = req.url.split('?')[0]
        const method = req.method.toUpperCase()

        // 1. HEALTH CHECK
        if (url === '/api/health' && method === 'GET') {
          return sendJson(res, 200, {
            status: 'healthy',
            connected: true,
            server: 'RVS Shared Local Database',
            timestamp: new Date().toISOString()
          })
        }

        const db = readDb()

        // 2. AUTHENTICATION: LOGIN
        if (url === '/api/auth/login' && method === 'POST') {
          const body = await getBody(req)
          const usernameClean = (body.username || '').trim().toLowerCase()
          const passwordClean = (body.password || '').trim()

          const userMatch = db.users.find(
            u => (u.username || '').toLowerCase() === usernameClean
          )

          if (!userMatch) {
            return sendJson(res, 404, {
              success: false,
              error: 'ACCOUNT_NOT_FOUND',
              message: `Account not found for username "${body.username}". This staff account has not been created yet. Please ask the Super Admin to add your account in User Management.`
            })
          }

          if (userMatch.password !== passwordClean) {
            return sendJson(res, 401, {
              success: false,
              error: 'INCORRECT_PASSWORD',
              message: `Incorrect password for username "${body.username}". Please check your password and try again.`
            })
          }

          return sendJson(res, 200, {
            success: true,
            user: userMatch
          })
        }

        // 3. USERS MANAGEMENT
        if (url === '/api/users') {
          if (method === 'GET') {
            return sendJson(res, 200, db.users)
          }
          if (method === 'POST') {
            const newUser = await getBody(req)
            const cleanUser = (newUser.username || '').trim().toLowerCase()
            if (db.users.some(u => (u.username || '').toLowerCase() === cleanUser)) {
              return sendJson(res, 400, {
                error: 'DUPLICATE_USERNAME',
                message: `Username "${newUser.username}" already exists.`
              })
            }
            db.users.push(newUser)
            writeDb(db)
            return sendJson(res, 201, { success: true, user: newUser })
          }
        }

        if (url.startsWith('/api/users/') && method === 'DELETE') {
          const userId = url.replace('/api/users/', '')
          db.users = db.users.filter(u => u.id !== userId)
          writeDb(db)
          return sendJson(res, 200, { success: true })
        }

        // 4. DISCOUNT POLICY
        if (url === '/api/discount-policy') {
          if (method === 'GET') {
            return sendJson(res, 200, db.discountPolicy || {
              discount_percent: 0,
              authorized_by: 'None',
              reason: 'Standard Bill Rate (No Discount Set)'
            })
          }
          if (method === 'POST') {
            const policy = await getBody(req)
            db.discountPolicy = {
              discount_percent: Number(policy.discount_percent) || 0,
              authorized_by: policy.authorized_by || 'Super Admin',
              reason: policy.reason || 'Clinical Package Discount',
              updated_at: new Date().toISOString()
            }
            writeDb(db)
            return sendJson(res, 200, { success: true, policy: db.discountPolicy })
          }
        }

        // 5. MEDICINES
        if (url === '/api/medicines') {
          if (method === 'GET') {
            return sendJson(res, 200, db.medicines)
          }
          if (method === 'POST') {
            const newMed = await getBody(req)
            db.medicines = [newMed, ...db.medicines.filter(m => m.id !== newMed.id)]
            writeDb(db)
            return sendJson(res, 201, newMed)
          }
        }

        if (url.startsWith('/api/medicines/') && method === 'PUT') {
          const medId = url.replace('/api/medicines/', '')
          const updated = await getBody(req)
          db.medicines = db.medicines.map(m => m.id === medId ? { ...m, ...updated } : m)
          writeDb(db)
          return sendJson(res, 200, updated)
        }

        if (url.startsWith('/api/medicines/') && method === 'DELETE') {
          const medId = url.replace('/api/medicines/', '')
          db.medicines = db.medicines.filter(m => m.id !== medId)
          db.batches = db.batches.filter(b => b.medicine_id !== medId)
          writeDb(db)
          return sendJson(res, 200, { success: true })
        }

        // 6. BATCHES
        if (url === '/api/batches') {
          if (method === 'GET') {
            return sendJson(res, 200, db.batches)
          }
          if (method === 'POST') {
            const newBatch = await getBody(req)
            db.batches = [newBatch, ...db.batches.filter(b => b.id !== newBatch.id)]
            writeDb(db)
            return sendJson(res, 201, newBatch)
          }
        }

        if (url.startsWith('/api/batches/') && method === 'PUT') {
          const batchId = url.replace('/api/batches/', '')
          const updated = await getBody(req)
          db.batches = db.batches.map(b => b.id === batchId ? { ...b, ...updated } : b)
          writeDb(db)
          return sendJson(res, 200, updated)
        }

        // 7. PATIENTS
        if (url === '/api/patients') {
          if (method === 'GET') {
            return sendJson(res, 200, db.patients)
          }
          if (method === 'POST') {
            const newPat = await getBody(req)
            db.patients = [newPat, ...db.patients.filter(p => p.id !== newPat.id)]
            writeDb(db)
            return sendJson(res, 201, newPat)
          }
        }

        // 8. SALES / INVOICES
        if (url === '/api/sales') {
          if (method === 'GET') {
            return sendJson(res, 200, db.sales)
          }
          if (method === 'POST') {
            const newSale = await getBody(req)
            db.sales = [newSale, ...db.sales.filter(s => s.id !== newSale.id)]
            writeDb(db)
            return sendJson(res, 201, newSale)
          }
        }

        // 9. SUPPLIERS
        if (url === '/api/suppliers') {
          if (method === 'GET') {
            return sendJson(res, 200, db.suppliers)
          }
          if (method === 'POST') {
            const newSup = await getBody(req)
            db.suppliers = [newSup, ...db.suppliers.filter(s => s.id !== newSup.id)]
            writeDb(db)
            return sendJson(res, 201, newSup)
          }
        }

        // 10. REQUISITIONS
        if (url === '/api/requisitions') {
          if (method === 'GET') {
            return sendJson(res, 200, db.requisitions)
          }
          if (method === 'POST') {
            const newReq = await getBody(req)
            db.requisitions = [newReq, ...db.requisitions.filter(r => r.id !== newReq.id)]
            writeDb(db)
            return sendJson(res, 201, newReq)
          }
        }

        if (url.startsWith('/api/requisitions/') && url.endsWith('/status') && method === 'PUT') {
          const reqId = url.replace('/api/requisitions/', '').replace('/status', '')
          const body = await getBody(req)
          db.requisitions = db.requisitions.map(r => r.id === reqId ? { ...r, status: body.status } : r)
          writeDb(db)
          return sendJson(res, 200, { success: true })
        }

        // 11. BULK SEED
        if (url === '/api/seed' && method === 'POST') {
          const payload = await getBody(req)
          if (payload.medicines) db.medicines = payload.medicines
          if (payload.batches) db.batches = payload.batches
          if (payload.patients) db.patients = payload.patients
          if (payload.suppliers) db.suppliers = payload.suppliers
          if (payload.requisitions) db.requisitions = payload.requisitions
          if (payload.sales) db.sales = payload.sales
          writeDb(db)
          return sendJson(res, 200, { success: true, message: 'All hospital data saved to local shared database!' })
        }

        // 12. DATABASE INSPECTOR
        if (url === '/api/db/stats' && method === 'GET') {
          return sendJson(res, 200, {
            connected: true,
            database: 'data/local_db.json',
            stats: {
              users: db.users.length,
              medicines: db.medicines.length,
              batches: db.batches.length,
              patients: db.patients.length,
              suppliers: db.suppliers.length,
              requisitions: db.requisitions.length,
              sales: db.sales.length
            }
          })
        }

        next()
      })
    }
  }
}
