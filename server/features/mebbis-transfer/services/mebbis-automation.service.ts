import puppeteer, { Browser, Page } from 'puppeteer';
import type { MEBBISSessionData } from '@shared/types/mebbis-transfer.types';
import { logger } from '../../../utils/logger.js';

export class MEBBISAutomationService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isInitialized = false;

  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async clickByXPath(xpath: string, timeout = 10000): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    const locator = this.page.locator(`::-p-xpath(${xpath})`);
    await locator.setTimeout(timeout);
    await locator.click();
  }

  private async waitForXPath(xpath: string, timeout = 10000): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    const locator = this.page.locator(`::-p-xpath(${xpath})`);
    await locator.setTimeout(timeout);
    await locator.wait();
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing MEBBIS automation browser...', 'MEBBISAutomation');
      
      const chromiumPath = '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium';
      
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: chromiumPath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions'
        ]
      });
      
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      logger.info('Navigating to MEBBIS...', 'MEBBISAutomation');
      await this.page.goto('https://mebbis.meb.gov.tr/', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      
      logger.info('MEBBIS page loaded successfully', 'MEBBISAutomation');
      this.isInitialized = true;
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to initialize MEBBIS browser', 'MEBBISAutomation', error);
      throw new Error(`MEBBIS browser başlatılamadı: ${err.message}`);
    }
  }

  async waitForLogin(): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      logger.info('Waiting for QR code login...', 'MEBBISAutomation');
      
      await this.page.waitForSelector('#lnkQrcode', { timeout: 15000 });
      await this.page.click('#lnkQrcode');
      
      await this.wait(2000);
      
      const qrScreenshotPath = 'public/mebbis-qr-code.png';
      await this.page.screenshot({ 
        path: qrScreenshotPath,
        fullPage: false
      });
      logger.info(`QR code screenshot saved to ${qrScreenshotPath}`, 'MEBBISAutomation');
      logger.info('⚠️ QR kodu telefonunuzla okutun: http://localhost:5000/mebbis-qr-code.png', 'MEBBISAutomation');
      
      logger.info('Waiting for user to scan QR code (3 minutes timeout)...', 'MEBBISAutomation');
      
      await this.page.waitForNavigation({
        waitUntil: 'domcontentloaded',
        timeout: 180000
      });
      
      const currentUrl = this.page.url();
      logger.info(`Navigated to: ${currentUrl}`, 'MEBBISAutomation');
      
      if (currentUrl.includes('main.aspx') || currentUrl.includes('Anasayfa')) {
        logger.info('✅ Login successful!', 'MEBBISAutomation');
      } else {
        throw new Error('Login failed - unexpected URL after navigation');
      }
    } catch (error) {
      const err = error as Error;
      logger.error('Login process failed', 'MEBBISAutomation', error);
      throw new Error(`MEBBIS girişi başarısız: ${err.message}`);
    }
  }

  async navigateToDataEntry(): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      logger.info('Navigating to data entry page...', 'MEBBISAutomation');
      
      await this.wait(1000);
      
      await this.clickByXPath("//td[@title='e-Rehberlik Modülü']");
      await this.wait(800);
      
      await this.clickByXPath("//td[@title='RPD Hizmetleri Veri Girişi']");
      await this.wait(800);
      
      await this.clickByXPath("//td[@title='Bireysel Veri Girişi']");
      await this.wait(1000);
      
      logger.info('Successfully navigated to data entry page', 'MEBBISAutomation');
    } catch (error) {
      const err = error as Error;
      logger.error('Navigation to data entry failed', 'MEBBISAutomation', error);
      throw new Error(`Veri giriş sayfasına gidilemedi: ${err.message}`);
    }
  }

  async fillSessionData(data: MEBBISSessionData): Promise<{ success: boolean; error?: string }> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      logger.info(`Processing session for student ${data.studentNo}`, 'MEBBISAutomation');
      
      await this.page.waitForSelector('#txtOgrenciArama', { timeout: 5000 });
      await this.page.click('#txtOgrenciArama', { clickCount: 3 });
      await this.page.type('#txtOgrenciArama', data.studentNo, { delay: 50 });
      
      await this.page.click('#btnOgrenciAra');
      await this.wait(1000);
      
      try {
        await this.waitForXPath("//img[@title='Aç']", 3000);
        await this.clickByXPath("//img[@title='Aç']", 3000);
        await this.wait(1500);
      } catch (e) {
        const errorMsg = `Öğrenci ${data.studentNo} bulunamadı veya açılamadı`;
        logger.warn(errorMsg, 'MEBBISAutomation');
        return { success: false, error: errorMsg };
      }
      
      await this.page.waitForSelector('#drp_hizmet_alani', { timeout: 5000 });
      await this.page.select('#drp_hizmet_alani', data.hizmetAlani);
      await this.wait(1000);
      
      await this.page.waitForSelector('#drp_bir', { timeout: 5000 });
      await this.page.select('#drp_bir', data.birinci);
      await this.wait(1000);
      
      await this.page.waitForSelector('#drp_iki', { timeout: 5000 });
      await this.page.select('#drp_iki', data.ikinci);
      await this.wait(1000);
      
      if (data.ucuncu) {
        try {
          await this.page.waitForSelector('#drp_uc', { timeout: 2000 });
          await this.page.select('#drp_uc', data.ucuncu);
          await this.wait(800);
        } catch (e) {
        }
      }
      
      await this.page.evaluate((date) => {
        const input = document.getElementById('txtgorusmetarihi') as HTMLInputElement;
        if (input) input.value = date;
      }, data.gorusmeTarihi);
      
      await this.page.evaluate((time) => {
        const input = document.getElementById('txtgorusmesaati') as HTMLInputElement;
        if (input) input.value = time;
      }, data.gorusmeSaati);
      
      await this.page.evaluate((time) => {
        const input = document.getElementById('txtgorusmebitissaati') as HTMLInputElement;
        if (input) input.value = time;
      }, data.gorusmeBitisSaati);
      
      await this.page.waitForSelector('#cmbCalismaYeri', { timeout: 5000 });
      await this.page.select('#cmbCalismaYeri', data.calismaYeri);
      await this.wait(800);
      
      await this.page.waitForSelector('#txtOturumSayisi', { timeout: 5000 });
      await this.page.click('#txtOturumSayisi', { clickCount: 3 });
      await this.page.type('#txtOturumSayisi', String(data.oturumSayisi), { delay: 50 });
      await this.wait(800);
      
      await this.page.click('#ramToolBar1_imgButtonKaydet');
      await this.wait(1500);
      
      const successMessage = await this.page.$eval(
        '#ramToolBar1_lblBilgi',
        el => el.textContent
      ).catch(() => '');
      
      if (successMessage && successMessage.includes('Kaydedilmiştir')) {
        logger.info(`Session saved successfully for student ${data.studentNo}`, 'MEBBISAutomation');
        
        await this.page.click('#ramToolBar1_imgButtonyeni');
        await this.wait(1000);
        
        return { success: true };
      } else {
        logger.warn(`Save failed for student ${data.studentNo}: ${successMessage}`, 'MEBBISAutomation');
        return { success: false, error: successMessage || 'Kayıt başarısız' };
      }
    } catch (error) {
      const err = error as Error;
      logger.error(`Error filling session data for student ${data.studentNo}`, 'MEBBISAutomation', error);
      return { success: false, error: err.message };
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      try {
        logger.info('Closing MEBBIS browser...', 'MEBBISAutomation');
        await this.browser.close();
        this.browser = null;
        this.page = null;
        this.isInitialized = false;
        logger.info('Browser closed successfully', 'MEBBISAutomation');
      } catch (error) {
        logger.error('Error closing browser', 'MEBBISAutomation', error);
      }
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.browser !== null && this.page !== null;
  }
}
