from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

def test_pass(poruka):
    print("PASS: "+poruka)
    
def test_fail(poruka):
    print("FAIL: "+poruka)

driver = webdriver.Chrome()
driver.get("https://programsko-inzenjerstvo-projekt-1.onrender.com")

wait = WebDriverWait(driver, 10) 

#provjera prijave suvlasnika

try:

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
        test_pass("Prijava uspješna i preusmjerenje na /suvlasnici")
    else:
        test_fail("Krivo preusmjerenje nakon prijave")
    
# prelazak na stranicu profila gdje ćemo ispitati promjenu lozinke

    profil_link = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='/profil']"))
    )
    profil_link.click()

    dashboard = WebDriverWait(driver, 15).until(
        EC.visibility_of_element_located((By.CLASS_NAME, "blockProfila"))
    )

    password_inputs = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "input[type='password']"))
    )

    old_password_input = password_inputs[0]
    new_password_input = password_inputs[1]
    confirm_password_input = password_inputs[2]

    old_password_input.send_keys("stanar123")
    new_password_input.send_keys("stanar")
    confirm_password_input.send_keys("stanar")

    wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
    ).click()

    test_pass("Lozinka promijenjena")
    
    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[text()='Odjavi se']")
        )   
    ).click()
    
    test_pass("Korisnik odjavljen")

# ponovno se pokusavamo prijaviti starom lozinkom - namjerno izazivanje greske

    username = wait.until(
        EC.visibility_of_element_located((By.ID, "usernameOrEmail"))
    )
    username.send_keys("stanar")

    password = driver.find_element(By.ID, "password")
    password.send_keys("stanar123")

    password.send_keys(Keys.ENTER)

    error_msg = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located(
            (By.XPATH, "//p[contains(text(), 'Pogrešno korisničko ime/email ili lozinka')]")
        )
    )

    test_pass("Pogrešna lozinka ispravno detektirana")

    password.clear()
    password.send_keys("stanar")

    password.send_keys(Keys.ENTER)

# vracanje lozinke na pocetnu

    wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='/profil']"))
    ).click()

    password_inputs = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "input[type='password']"))
    )   

    old_password_input = password_inputs[0]
    new_password_input = password_inputs[1]
    confirm_password_input = password_inputs[2]

    old_password_input.send_keys("stanar")
    new_password_input.send_keys("stanar123")
    confirm_password_input.send_keys("stanar123")

    wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
    ).click()

    test_pass("Lozinka vraćena na početnu")

    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[text()='Odjavi se']")
        )
    ).click()

except Exception as e:
    test_fail(f"Test prekinut zbog greške: {e}")

finally:
    driver.quit()
