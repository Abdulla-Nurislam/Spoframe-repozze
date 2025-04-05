const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

// Директории с изображениями
const imageDirectories = [
    'src/client/assets/images', 
    'public/images'
];

// Поддерживаемые форматы
const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif'];

// Настройки оптимизации
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;
const WEBP_QUALITY = 75;

// Целевые размеры для адаптивных изображений
const sizes = [
    { width: 1920, suffix: 'xl' },
    { width: 1280, suffix: 'lg' },
    { width: 768, suffix: 'md' },
    { width: 480, suffix: 'sm' }
];

/**
 * Оптимизирует изображения в указанных директориях
 */
async function optimizeImages() {
    console.log('🔍 Начинаем оптимизацию изображений...');
    
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    let totalFiles = 0;
    
    for (const dir of imageDirectories) {
        try {
            // Проверяем существование директории
            try {
                await fs.access(dir);
            } catch (error) {
                console.log(`⚠️ Директория ${dir} не существует, создаем...`);
                await fs.mkdir(dir, { recursive: true });
                continue;
            }
            
            // Получаем список файлов
            const files = await fs.readdir(dir);
            
            // Создаем директорию для оптимизированных изображений
            const optimizedDir = path.join(dir, 'optimized');
            try {
                await fs.access(optimizedDir);
            } catch (error) {
                await fs.mkdir(optimizedDir, { recursive: true });
            }
            
            // Создаем директорию для WebP изображений
            const webpDir = path.join(dir, 'webp');
            try {
                await fs.access(webpDir);
            } catch (error) {
                await fs.mkdir(webpDir, { recursive: true });
            }
            
            // Создаем директорию для адаптивных изображений
            const responsiveDir = path.join(dir, 'responsive');
            try {
                await fs.access(responsiveDir);
            } catch (error) {
                await fs.mkdir(responsiveDir, { recursive: true });
            }
            
            // Обрабатываем каждый файл
            for (const file of files) {
                const filePath = path.join(dir, file);
                const fileExt = path.extname(file).toLowerCase();
                const fileName = path.parse(file).name;
                
                // Проверяем, является ли файл изображением
                if (!supportedFormats.includes(fileExt)) {
                    continue;
                }
                
                // Получаем информацию о файле
                const stats = await fs.stat(filePath);
                if (!stats.isFile()) {
                    continue;
                }
                
                totalFiles++;
                
                console.log(`\n📸 Оптимизация ${filePath}...`);
                
                // Получаем исходный размер
                const originalSize = stats.size;
                totalOriginalSize += originalSize;
                
                try {
                    // Оптимизация основного изображения
                    const optimizedFilePath = path.join(optimizedDir, file);
                    
                    if (fileExt === '.jpg' || fileExt === '.jpeg') {
                        await sharp(filePath)
                            .jpeg({ 
                                quality: JPEG_QUALITY, 
                                progressive: true,
                                mozjpeg: true
                            })
                            .toFile(optimizedFilePath);
                    } else if (fileExt === '.png') {
                        await sharp(filePath)
                            .png({ 
                                quality: PNG_QUALITY, 
                                progressive: true,
                                compressionLevel: 9,
                                adaptiveFiltering: true,
                                palette: true
                            })
                            .toFile(optimizedFilePath);
                    } else if (fileExt === '.gif') {
                        // Копируем GIF без изменений (sharp не поддерживает оптимизацию GIF)
                        await fs.copyFile(filePath, optimizedFilePath);
                    }
                    
                    // Создаем WebP версию
                    const webpFilePath = path.join(webpDir, `${fileName}.webp`);
                    await sharp(filePath)
                        .webp({ 
                            quality: WEBP_QUALITY,
                            reductionEffort: 6
                        })
                        .toFile(webpFilePath);
                    
                    // Создаем адаптивные изображения
                    for (const size of sizes) {
                        const responsiveFilePath = path.join(
                            responsiveDir, 
                            `${fileName}-${size.suffix}${fileExt}`
                        );
                        
                        await sharp(filePath)
                            .resize(size.width, null, {
                                fit: 'inside',
                                withoutEnlargement: true
                            })
                            .jpeg({ quality: JPEG_QUALITY, progressive: true })
                            .toFile(responsiveFilePath);
                        
                        // Также создаем WebP версию для каждого размера
                        const responsiveWebpFilePath = path.join(
                            responsiveDir, 
                            `${fileName}-${size.suffix}.webp`
                        );
                        
                        await sharp(filePath)
                            .resize(size.width, null, {
                                fit: 'inside',
                                withoutEnlargement: true
                            })
                            .webp({ quality: WEBP_QUALITY })
                            .toFile(responsiveWebpFilePath);
                    }
                    
                    // Получаем размеры файлов после оптимизации
                    const optimizedStats = await fs.stat(optimizedFilePath);
                    const optimizedSize = optimizedStats.size;
                    totalOptimizedSize += optimizedSize;
                    
                    const webpStats = await fs.stat(webpFilePath);
                    const webpSize = webpStats.size;
                    
                    // Выводим результаты
                    const originalSizeFormatted = formatSize(originalSize);
                    const optimizedSizeFormatted = formatSize(optimizedSize);
                    const webpSizeFormatted = formatSize(webpSize);
                    
                    const optimizedSavingsPercent = Math.round((1 - optimizedSize / originalSize) * 100);
                    const webpSavingsPercent = Math.round((1 - webpSize / originalSize) * 100);
                    
                    console.log(`  Оригинал: ${originalSizeFormatted}`);
                    console.log(`  Оптимизированный: ${optimizedSizeFormatted} (${optimizedSavingsPercent}% экономия)`);
                    console.log(`  WebP: ${webpSizeFormatted} (${webpSavingsPercent}% экономия)`);
                    console.log(`  Созданы адаптивные версии для размеров: ${sizes.map(s => s.suffix).join(', ')}`);
                } catch (error) {
                    console.error(`  ❌ Ошибка при оптимизации ${filePath}:`, error);
                }
            }
        } catch (error) {
            console.error(`❌ Ошибка при обработке директории ${dir}:`, error);
        }
    }
    
    // Отображаем общую статистику
    if (totalFiles > 0) {
        const totalSavingsPercent = Math.round((1 - totalOptimizedSize / totalOriginalSize) * 100);
        console.log(`\n📊 Общая статистика:`);
        console.log(`  Обработано файлов: ${totalFiles}`);
        console.log(`  Исходный размер: ${formatSize(totalOriginalSize)}`);
        console.log(`  Оптимизированный размер: ${formatSize(totalOptimizedSize)}`);
        console.log(`  Экономия: ${formatSize(totalOriginalSize - totalOptimizedSize)} (${totalSavingsPercent}%)`);
    }
    
    console.log('\n✅ Оптимизация изображений завершена!');
}

/**
 * Форматирует размер файла в читаемом виде
 * @param {number} bytes - Размер в байтах
 * @returns {string} Форматированный размер
 */
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Запускаем оптимизацию
optimizeImages().catch(error => {
    console.error('❌ Произошла критическая ошибка:', error);
    process.exit(1);
}); 