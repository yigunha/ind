<<<<<<< HEAD
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const uploadDir = path.join(process.cwd(), '/public/uploads');

  // If the folder does not exist, create it
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new formidable.IncomingForm({
    uploadDir: uploadDir,
    keepExtensions: true,
    // formidable v3 requires you to handle renaming manually for keeping the original name
    filename: (name, ext, part, form) => {
      // You can return a custom filename here if needed
      // For example, to keep the original filename:
      // return part.originalFilename;
      // For now, let formidable handle the unique name generation
      return new Date().getTime().toString() + ext;
    }
  });


  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form: ', err);
      return res.status(500).json({ error: 'File upload failed due to a parsing error.' });
    }

    // Check if the file was actually uploaded
    const uploadedFile = files.file?.[0]; // formidable v3 nests files in an array

    if (!uploadedFile) {
        return res.status(400).json({ error: 'No file was uploaded.' });
    }

    // Log the details of the uploaded file for debugging
    console.log('File uploaded successfully:');
    console.log('- Original name:', uploadedFile.originalFilename);
    console.log('- New path:', uploadedFile.filepath);
    console.log('- Size:', uploadedFile.size);

    // You can now perform additional operations with the file,
    // like reading it with a library like 'xlsx'.

    return res.status(200).json({ message: 'Upload successful!', path: uploadedFile.filepath });
  });
=======
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const uploadDir = path.join(process.cwd(), '/public/uploads');

  // If the folder does not exist, create it
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new formidable.IncomingForm({
    uploadDir: uploadDir,
    keepExtensions: true,
    // formidable v3 requires you to handle renaming manually for keeping the original name
    filename: (name, ext, part, form) => {
      // You can return a custom filename here if needed
      // For example, to keep the original filename:
      // return part.originalFilename;
      // For now, let formidable handle the unique name generation
      return new Date().getTime().toString() + ext;
    }
  });


  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form: ', err);
      return res.status(500).json({ error: 'File upload failed due to a parsing error.' });
    }

    // Check if the file was actually uploaded
    const uploadedFile = files.file?.[0]; // formidable v3 nests files in an array

    if (!uploadedFile) {
        return res.status(400).json({ error: 'No file was uploaded.' });
    }

    // Log the details of the uploaded file for debugging
    console.log('File uploaded successfully:');
    console.log('- Original name:', uploadedFile.originalFilename);
    console.log('- New path:', uploadedFile.filepath);
    console.log('- Size:', uploadedFile.size);

    // You can now perform additional operations with the file,
    // like reading it with a library like 'xlsx'.

    return res.status(200).json({ message: 'Upload successful!', path: uploadedFile.filepath });
  });
>>>>>>> 7adfbd1c97ca611d06e414ca80d620744c064b3a
}