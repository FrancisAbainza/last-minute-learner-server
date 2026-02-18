
import officeParser from 'officeparser';
import pdf from 'pdf-parse';

export const extractPdfText = async (file) => {
  if (!file) {
    return '';
  }

  const data = await pdf(file.buffer);
  return data.text;
}

const extractTextFromContent = (item) => {
  if (!item) return '';
  
  let texts = [];
  
  // Add the item's text if it exists
  if (item.text && item.text.trim() !== '') {
    texts.push(item.text);
  }
  
  // Recursively extract text from children
  if (item.children && Array.isArray(item.children)) {
    item.children.forEach(child => {
      const childText = extractTextFromContent(child);
      if (childText) {
        texts.push(childText);
      }
    });
  }
  
  return texts.join(' ');
};

export const extractOfficeText = async (file) => {
  if (!file) {
    return '';
  }
  const parsed = await officeParser.parseOffice(file.buffer);
  // Extract text from the content array, excluding metadata
  if (parsed && parsed.content && Array.isArray(parsed.content)) {
    return parsed.content
      .map(item => extractTextFromContent(item))
      .filter(text => text.trim() !== '')
      .join('\n');
  }
  return '';
}

export const extractText = async (file) => {
  if (!file) {
    return '';
  }

  const mimeType = file.mimetype || '';
  const fileName = file.originalname || file.name || '';

  // Check by mimetype first
  if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    return await extractPdfText(file);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.toLowerCase().endsWith('.docx') ||
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    fileName.toLowerCase().endsWith('.pptx')
  ) {
    return await extractOfficeText(file);
  } else {
    throw new Error(`Unsupported file type: ${mimeType || fileName}`);
  }
}