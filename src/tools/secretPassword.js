export function secretPassword() {
    let alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I', 'J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','1','2','3','4','5','6','7','8', '9','0','!','?']
    let secret="";
    for (let n=0; n<12; n++) {
        secret+=alphabet[Math.floor(Math.random()*63)];
    }
    return secret;
}