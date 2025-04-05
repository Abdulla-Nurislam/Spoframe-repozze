const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { promisify } = require('util');
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

// Директории с изображениями
const imageDirectories = ['images', 'public/images'];
// Поддерживаемые форматы
const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif'];

async function optimizeImages() {
    console.log('Начинаем оптимизацию изображений...');
    
    for (const dir of imageDirectories) {
        try {
            // Проверяем существование директории
            try {
                await fs.access(dir);
            } catch (error) {
                console.log(`Директория ${dir} не существует, пропускаем...`);
                continue;
            }
            
            // Получаем список файлов
            const files = await fs.readdir(dir);
            
            // Создаем директорию для оптимизированных изображений, если она не существует
            const optimizedDir = path.join(dir, 'optimized');
            try {
                await fs.access(optimizedDir);
            } catch (error) {
                await fs.mkdir(optimizedDir);
            }
            
            // Создаем директорию для WebP изображений, если она не существует
            const webpDir = path.join(dir, 'webp');
            try {
                await fs.access(webpDir);
            } catch (error) {
                await fs.mkdir(webpDir);
            }
            
            // Обрабатываем каждый файл
            for (const file of files) {
                const filePath = path.join(dir, file);
                const fileExt = path.extname(file).toLowerCase();
                
                // Проверяем, является ли файл изображением
                if (!supportedFormats.includes(fileExt)) {
                    continue;
                }
                
                // Получаем информацию о файле
                const stats = await fs.stat(filePath);
                if (!stats.isFile()) {
                    continue;
                }
                
                console.log(`Оптимизация ${filePath}...`);
                
                // Оптимизируем изображение
                const optimizedFilePath = path.join(optimizedDir, file);
                
                try {
                    // Оптимизация JPEG/PNG
                    if (fileExt === '.jpg' || fileExt === '.jpeg') {
                        await sharp(filePath)
                            .jpeg({ quality: 80, progressive: true })
                            .toFile(optimizedFilePath);
                    } else if (fileExt === '.png') {
                        await sharp(filePath)
                            .png({ quality: 80, progressive: true })
                            .toFile(optimizedFilePath);
                    } else if (fileExt === '.gif') {
                        // Копируем GIF без изменений (sharp не поддерживает оптимизацию GIF)
                        await fs.copyFile(filePath, optimizedFilePath);
                    }
                    
                    // Создаем WebP версию
                    const webpFilePath = path.join(webpDir, `${path.parse(file).name}.webp`);
                    await sharp(filePath)
                        .webp({ quality: 80 })
                        .toFile(webpFilePath);
                    
                    // Получаем размеры файлов
                    const originalSize = stats.size;
                    const optimizedStats = await fs.stat(optimizedFilePath);
                    const optimizedSize = optimizedStats.size;
                    const webpStats = await fs.stat(webpFilePath);
                    const webpSize = webpStats.size;
                    
                    // Выводим результаты
                    console.log(`  Оригинал: ${(originalSize / 1024).toFixed(2)} KB`);
                    console.log(`  Оптимизированный: ${(optimizedSize / 1024).toFixed(2)} KB (${(100 - optimizedSize / originalSize * 100).toFixed(2)}% экономия)`);
                    console.log(`  WebP: ${(webpSize / 1024).toFixed(2)} KB (${(100 - webpSize / originalSize * 100).toFixed(2)}% экономия)`);
                } catch (error) {
                    console.error(`  Ошибка при оптимизации ${filePath}:`, error);
                }
            }
        } catch (error) {
            console.error(`Ошибка при обработке директории ${dir}:`, error);
        }
    }
    
    console.log('Оптимизация изображений завершена!');
}

// Запускаем оптимизацию
optimizeImages().catch(error => {
    console.error('Произошла ошибка:', error);
}); 