public class checkstyle {

    @SuppressWarnings("illegalcatch")
    public void importantMethod() {
        try {
            throw new RuntimeException("error");
        } catch (Exception ex) {
            // ignore
        }
    }
}