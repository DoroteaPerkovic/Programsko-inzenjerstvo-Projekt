from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

driver = webdriver.Chrome()
driver.get("https://programsko-inzenjerstvo-projekt-1.onrender.com")

wait = WebDriverWait(driver, 10) 

username = wait.until(
    EC.visibility_of_element_located((By.ID, "usernameOrEmail"))
    )
username.send_keys("stanar")

password = driver.find_element(By.ID, "password")
password.send_keys("stanar123")

password.send_keys(Keys.ENTER)

dashboard = WebDriverWait(driver, 15).until(
    EC.visibility_of_element_located((By.CLASS_NAME, "okvirAS"))
    )

current_url = driver.current_url
if "/suvlasnici" in current_url:
    print("Prijava uspješna i preusmjerenje na /suvlasnici")
else:
    print("Krivo preusmjerenje nakon prijave")

driver.quit()
